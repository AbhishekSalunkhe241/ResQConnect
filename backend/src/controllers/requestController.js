import mongoose from 'mongoose';
import Request from '../models/Request.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';
import { generateNextRequestId, getFormattedTimestamp } from '../utils/requestIdGenerator.js';
import { logAudit } from '../utils/auditLogger.js';
import { notifyUser } from '../utils/notificationHelper.js';

// Valid transitions dictionary
const VALID_TRANSITIONS = {
  Submitted: ['Under Verification', 'Rejected'],
  'Under Verification': ['Verified', 'Rejected'],
  Verified: ['Matched', 'Rejected'],
  Matched: ['Assistance In Progress', 'Rejected'],
  'Assistance In Progress': ['Completed', 'Rejected'],
  Completed: ['Closed'],
  Closed: [],
  Rejected: [],
};

/**
 * Helper to find request by custom ID (RQ-1025) or MongoDB ObjectId
 */
export const findRequestByIdOrCustomId = async (idParam) => {
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    const byMongoId = await Request.findById(idParam);
    if (byMongoId) return byMongoId;
  }
  return Request.findOne({ id: idParam });
};

/**
 * @route   GET /api/requests
 * @desc    List assistance requests filtered by user role
 * @access  Private
 */
export const getRequests = async (req, res, next) => {
  try {
    const { category, priority, status, search } = req.query;
    let query = {};

    // Role-based visibility scoping
    if (req.user.role === 'citizen') {
      // Citizens strictly access their own requests by authenticated account ID only
      query['requester.userId'] = req.user._id;
    } else if (req.user.role === 'volunteer') {
      // Volunteers view assigned requests + available eligible pool
      query.$or = [
        { 'assignedVolunteer.id': req.user._id },
        {
          status: { $in: ['Verified', 'Matched'] },
          'assignedVolunteer.id': null,
          isFlagged: false,
        },
      ];
    }
    // NGOs and Admins view all requests

    // Optional query filters
    if (category && category !== 'All') {
      query.category = category;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (search) {
      const searchConditions = [
        { title: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const requests = await Request.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/requests/:id
 * @desc    Get single request details by ID
 * @access  Private
 */
export const getRequestById = async (req, res, next) => {
  try {
    const request = await findRequestByIdOrCustomId(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Request '${req.params.id}' not found.`,
      });
    }

    // Citizen ownership check - strictly authenticate against account ID
    const isOwner = Boolean(request.requester.userId && request.requester.userId.equals(req.user._id));
    if (req.user.role === 'citizen' && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own assistance requests.',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const ALLOWED_CATEGORIES = [
  'Food & Water',
  'Medical Assistance',
  'Shelter',
  'Clothing',
  'Transportation',
  'Household Supplies',
  'Financial Assistance',
  'Other',
];

export const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

/**
 * @route   POST /api/requests
 * @desc    Lodge new assistance request (Citizen only)
 * @access  Private (Citizen)
 */
export const createRequest = async (req, res, next) => {
  try {
    const {
      category,
      priority,
      title,
      description,
      addressDetails,
      location,
      peopleAffected,
      accessibility,
      additionalNotes,
      itemsNeeded,
    } = req.body;

    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid or missing category. Allowed categories are: ${ALLOWED_CATEGORIES.join(', ')}.`,
      });
    }

    const assignedPriority = priority || 'Medium';
    if (!ALLOWED_PRIORITIES.includes(assignedPriority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority level '${priority}'. Allowed priorities are: ${ALLOWED_PRIORITIES.join(', ')}.`,
      });
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a detailed description (minimum 10 characters).',
      });
    }

    if (!addressDetails || typeof addressDetails !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Complete address details (street address, city, state, postal code) are required.',
      });
    }

    const { address: street, city: cName, state: sName, postalCode: pCode } = addressDetails;
    if (!street || !String(street).trim() || !cName || !String(cName).trim() || !sName || !String(sName).trim() || !pCode || !String(pCode).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Street address, city, state, and postal code are all mandatory address fields.',
      });
    }

    const countAffected = Number(peopleAffected !== undefined ? peopleAffected : 1);
    if (!Number.isInteger(countAffected) || countAffected < 1) {
      return res.status(400).json({
        success: false,
        message: 'People affected must be a positive whole number of at least 1.',
      });
    }

    // Validate itemsNeeded if provided
    let items = [{ item: `${category} assistance kit`, qty: 1, unit: 'units' }];
    if (Array.isArray(itemsNeeded) && itemsNeeded.length > 0) {
      for (const itm of itemsNeeded) {
        if (!itm || !itm.item || !String(itm.item).trim() || !Number.isInteger(Number(itm.qty)) || Number(itm.qty) < 1) {
          return res.status(400).json({
            success: false,
            message: 'Each requested item must have a non-empty name and a positive quantity.',
          });
        }
      }
      items = itemsNeeded.map(i => ({
        item: String(i.item).trim(),
        qty: Number(i.qty),
        unit: String(i.unit || 'units').trim(),
      }));
    }

    // Duplicate submission prevention: check for identical pending request from same citizen within 60s
    const cleanStreet = String(street).trim();
    const cleanCity = String(cName).trim();
    const recentDuplicate = await Request.findOne({
      'requester.userId': req.user._id,
      category,
      status: 'Submitted',
      'addressDetails.address': cleanStreet,
      'addressDetails.city': cleanCity,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
    });

    if (recentDuplicate) {
      return res.status(409).json({
        success: false,
        message: `A duplicate assistance request (${recentDuplicate.id}) was already submitted within the past minute. Please monitor your existing request.`,
        existingRequestId: recentDuplicate.id,
      });
    }

    const newId = await generateNextRequestId();
    const timestampStr = getFormattedTimestamp();

    const fullLocation = location || `${cleanStreet}, ${cleanCity}, ${String(sName).trim()} - ${String(pCode).trim()}`;

    const newRequest = await Request.create({
      id: newId,
      category,
      priority: assignedPriority,
      status: 'Submitted',
      title: title || `${category} recovery support for ${countAffected} people in ${cleanCity}`,
      description: description.trim(),
      location: fullLocation,
      addressDetails: {
        address: cleanStreet,
        city: cleanCity,
        state: String(sName).trim(),
        postalCode: String(pCode).trim(),
      },
      peopleAffected: countAffected,
      accessibility: accessibility || 'None',
      additionalNotes: additionalNotes ? String(additionalNotes).trim() : '',
      requester: {
        userId: req.user._id,
        name: req.user.name,
        phone: req.user.phone || '',
        type: 'Citizen',
        affectedCount: countAffected,
      },
      itemsNeeded: items,
      timeline: [
        {
          step: 'Submitted',
          timestamp: timestampStr,
          note: 'Request lodged via Citizen Portal and queued for intake verification.',
        },
      ],
    });

    // Notify citizen
    await notifyUser({
      userId: req.user._id,
      requestId: newId,
      type: 'submitted',
      title: 'Request Submitted',
      desc: `Your request ${newId} has been lodged and queued for intake verification.`,
    });

    // Audit log
    await logAudit({
      actionType: 'REQUEST_SUBMITTED',
      actor: req.user.name,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: newId,
      targetType: 'Assistance Request',
      details: `New request lodged for category "${category}" at ${fullLocation}`,
    });

    res.status(201).json({
      success: true,
      data: newRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/requests/:id/status
 * @desc    Transition request status (NGO, Admin)
 * @access  Private (NGO, Admin)
 */
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status: newStatus, note: customNote } = req.body;
    const request = await findRequestByIdOrCustomId(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Request '${req.params.id}' not found.`,
      });
    }

    const currentStatus = request.status;
    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

    if (currentStatus !== newStatus && !allowedNext.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${newStatus}'.`,
      });
    }

    const timestampStr = getFormattedTimestamp();
    const noteText = customNote || `Status updated from ${currentStatus} to ${newStatus}.`;

    request.status = newStatus;
    request.timeline.push({
      step: newStatus,
      timestamp: timestampStr,
      note: noteText,
    });

    if (['Completed', 'Closed'].includes(newStatus)) {
      request.estimatedAssistance = 'Delivered';
      if (newStatus === 'Completed') {
        request.completedAt = timestampStr;
      }
    }

    await request.save();

    // Notify requester citizen
    await notifyUser({
      userId: request.requester.userId,
      requestId: request.id,
      type: newStatus === 'Completed' ? 'completed' : newStatus === 'Verified' ? 'verification' : 'status',
      title: `Status Updated: ${newStatus}`,
      desc: `Your request ${request.id} is now "${newStatus}". Note: ${noteText}`,
    });

    // Audit log
    await logAudit({
      actionType: 'STATUS_CHANGE',
      actor: req.user.name,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: request.id,
      targetType: 'Assistance Request',
      details: `Status advanced from "${currentStatus}" to "${newStatus}". Note: ${noteText}`,
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/requests/:id/volunteer/claim
 * @desc    Volunteer claims an eligible verified task
 * @access  Private (Volunteer)
 */
export const claimVolunteerTask = async (req, res, next) => {
  try {
    const isMongoId = mongoose.Types.ObjectId.isValid(req.params.id);
    const idFilter = isMongoId
      ? { $or: [{ _id: req.params.id }, { id: req.params.id }] }
      : { id: req.params.id };

    const existing = await findRequestByIdOrCustomId(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (existing.assignedVolunteer && existing.assignedVolunteer.id && !existing.assignedVolunteer.id.equals(req.user._id)) {
      return res.status(409).json({
        success: false,
        message: 'This task has already been claimed by another volunteer.',
      });
    }

    if (!['Verified', 'Matched'].includes(existing.status)) {
      return res.status(400).json({
        success: false,
        message: `This task is in status '${existing.status}' and is not available to claim.`,
      });
    }

    const timestampStr = getFormattedTimestamp();

    // Atomic claim: guarantees no concurrent volunteer race condition
    const request = await Request.findOneAndUpdate(
      {
        ...idFilter,
        status: { $in: ['Verified', 'Matched'] },
        $or: [
          { 'assignedVolunteer.id': null },
          { 'assignedVolunteer.id': { $exists: false } },
          { 'assignedVolunteer.id': req.user._id },
        ],
      },
      {
        $set: {
          status: 'Assistance In Progress',
          assignedVolunteer: {
            id: req.user._id,
            name: req.user.name,
            phone: req.user.phone || '',
            badge: req.user.badge || 'Field Responder',
          },
        },
        $push: {
          timeline: {
            step: 'Assistance In Progress',
            timestamp: timestampStr,
            note: `Volunteer ${req.user.name} accepted task and mobilized dispatch.`,
          },
        },
      },
      { new: true }
    );

    if (!request) {
      return res.status(409).json({
        success: false,
        message: 'This task has already been claimed by another volunteer or its state changed.',
      });
    }

    // Update volunteer profile status
    await User.findByIdAndUpdate(req.user._id, {
      status: 'On Field Mission',
      $inc: { assignedTasksCount: 1 },
    });

    // Notify requester citizen
    await notifyUser({
      userId: request.requester.userId,
      requestId: request.id,
      type: 'progress',
      title: 'Volunteer Dispatched',
      desc: `${req.user.name} has accepted your request ${request.id} and is preparing relief transit.`,
    });

    // Audit log
    await logAudit({
      actionType: 'VOLUNTEER_ACCEPT',
      actor: req.user.name,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: request.id,
      targetType: 'Assistance Request',
      details: `Volunteer ${req.user.name} claimed task ${request.id}`,
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/requests/:id/volunteer/checkin
 * @desc    Assigned volunteer posts a progress note
 * @access  Private (Assigned Volunteer)
 */
export const addVolunteerCheckIn = async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a progress check-in note.' });
    }

    const request = await findRequestByIdOrCustomId(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Verify task is currently assigned to this volunteer
    if (!request.assignedVolunteer || !request.assignedVolunteer.id || !request.assignedVolunteer.id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the volunteer assigned to this active task can post progress updates.',
      });
    }

    if (request.status !== 'Assistance In Progress') {
      return res.status(400).json({
        success: false,
        message: 'Progress check-ins can only be added to tasks in "Assistance In Progress" status.',
      });
    }

    const timestampStr = getFormattedTimestamp();

    request.checkInNotes.push({
      timestamp: timestampStr,
      note: note.trim(),
      author: req.user.name,
    });

    request.timeline.push({
      step: 'Field Check-in',
      timestamp: timestampStr,
      note: `Progress update by ${req.user.name}: ${note.trim()}`,
    });

    await request.save();

    // Notify requester citizen
    await notifyUser({
      userId: request.requester.userId,
      requestId: request.id,
      type: 'progress',
      title: 'Field Check-In Update',
      desc: `Update on ${request.id}: ${note.trim()}`,
    });

    // Audit log
    await logAudit({
      actionType: 'VOLUNTEER_CHECKIN',
      actor: req.user.name,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: request.id,
      targetType: 'Assistance Request',
      details: `${req.user.name} added progress check-in: "${note.trim()}"`,
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/requests/:id/volunteer/complete
 * @desc    Assigned volunteer marks task completed with proof
 * @access  Private (Assigned Volunteer)
 */
export const completeVolunteerTask = async (req, res, next) => {
  try {
    const { completionNote, proofDescription } = req.body;
    const request = await findRequestByIdOrCustomId(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (!request.assignedVolunteer || !request.assignedVolunteer.id || !request.assignedVolunteer.id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the volunteer assigned to this active task can mark it completed.',
      });
    }

    if (request.status !== 'Assistance In Progress') {
      return res.status(400).json({
        success: false,
        message: 'Only tasks actively in progress can be marked completed.',
      });
    }

    const timestampStr = getFormattedTimestamp();
    const finalNote = completionNote || 'Relief delivered and signed off.';

    request.status = 'Completed';
    request.completionNote = finalNote;
    request.proofDescription = proofDescription || 'In-person verification confirmed.';
    request.completedAt = timestampStr;
    request.estimatedAssistance = 'Delivered';

    request.timeline.push({
      step: 'Completed',
      timestamp: timestampStr,
      note: `Relief delivered & signed off by ${req.user.name}. ${finalNote}`,
    });

    await request.save();

    // Release volunteer status back to Available
    await User.findByIdAndUpdate(req.user._id, {
      status: 'Available',
      $inc: { completedTasksCount: 1, assignedTasksCount: -1 },
    });

    // Notify citizen
    await notifyUser({
      userId: request.requester.userId,
      requestId: request.id,
      type: 'completed',
      title: 'Assistance Delivered & Completed',
      desc: `Relief mission for ${request.id} has been marked Completed by ${req.user.name}.`,
    });

    // Audit log
    await logAudit({
      actionType: 'TASK_COMPLETED',
      actor: req.user.name,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: request.id,
      targetType: 'Assistance Request',
      details: `Task completed by ${req.user.name}. Note: ${finalNote}`,
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/requests/:id/ngo/assign
 * @desc    NGO assigns an available volunteer to request
 * @access  Private (NGO, Admin)
 */
export const assignVolunteerToRequest = async (req, res, next) => {
  try {
    const { volunteerId } = req.body;
    if (!volunteerId) {
      return res.status(400).json({ success: false, message: 'Please specify volunteerId to assign.' });
    }

    const request = await findRequestByIdOrCustomId(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Authorization check: An NGO cannot reassign volunteers on requests managed by another NGO
    if (request.assignedOrganization && request.assignedOrganization.id && req.user.role === 'ngo') {
      if (!request.assignedOrganization.id.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: This request is currently managed by another organization.',
        });
      }
    }

    if (!['Submitted', 'Under Verification', 'Verified', 'Matched'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot assign volunteer to request in status '${request.status}'.`,
      });
    }

    // Lookup volunteer (by ObjectId, or by name/email)
    let volunteer = null;
    if (mongoose.Types.ObjectId.isValid(volunteerId)) {
      volunteer = await User.findById(volunteerId);
    }
    if (!volunteer) {
      volunteer = await User.findOne({
        role: 'volunteer',
        $or: [
          { name: new RegExp(`^${volunteerId}$`, 'i') },
          { email: String(volunteerId).toLowerCase() },
        ],
      });
    }
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(400).json({ success: false, message: 'Selected user is not a valid volunteer.' });
    }

    if (!volunteer.verified) {
      return res.status(400).json({ success: false, message: 'Cannot assign an unverified volunteer.' });
    }

    if (volunteer.status !== 'Available') {
      return res.status(409).json({
        success: false,
        message: `Volunteer ${volunteer.name} is currently '${volunteer.status}' and cannot take new assignments.`,
      });
    }

    const timestampStr = getFormattedTimestamp();

    request.status = 'Matched';
    request.assignedVolunteer = {
      id: volunteer._id,
      name: volunteer.name,
      phone: volunteer.phone || '',
      badge: volunteer.badge || 'Field Responder',
    };
    if (!request.assignedOrganization || !request.assignedOrganization.id) {
      request.assignedOrganization = {
        id: req.user._id,
        name: req.user.name,
      };
    }
    request.timeline.push({
      step: 'Matched',
      timestamp: timestampStr,
      note: `${req.user.name} assigned field volunteer ${volunteer.name} for direct delivery.`,
    });

    await request.save();

    // Update volunteer
    volunteer.status = 'On Field Mission';
    volunteer.assignedTasksCount = (volunteer.assignedTasksCount || 0) + 1;
    await volunteer.save();

    // Notify citizen
    await notifyUser({
      userId: request.requester.userId,
      requestId: request.id,
      type: 'match',
      title: 'Volunteer Assigned',
      desc: `Field volunteer ${volunteer.name} has been assigned to request ${request.id}.`,
    });

    // Notify volunteer
    await notifyUser({
      userId: volunteer._id,
      requestId: request.id,
      type: 'match',
      title: 'New Mission Assigned',
      desc: `You have been assigned to assistance request ${request.id} in ${request.location}.`,
    });

    // Audit log
    await logAudit({
      actionType: 'VOLUNTEER_ASSIGN',
      actor: req.user.name,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: request.id,
      targetType: 'Assistance Request',
      details: `Assigned volunteer ${volunteer.name} to request ${request.id}`,
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/requests/:id/ngo/allocate
 * @desc    NGO allocates relief inventory with atomic stock deduction
 * @access  Private (NGO, Admin)
 */
export const allocateResourceToRequest = async (req, res, next) => {
  try {
    const { resourceId, quantity } = req.body;
    const qty = Number(quantity);

    if (!resourceId || !Number.isSafeInteger(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid resourceId and a whole quantity greater than zero.',
      });
    }

    const request = await findRequestByIdOrCustomId(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Authorization check: An NGO cannot alter allocations on requests managed by another NGO
    if (request.assignedOrganization && request.assignedOrganization.id && req.user.role === 'ngo') {
      if (!request.assignedOrganization.id.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: This request is managed by another organization.',
        });
      }
    }

    // Check duplicate allocation on same request
    const alreadyAllocated = (request.allocatedResources || []).some(
      (item) => item.resourceId && item.resourceId.toString() === resourceId.toString()
    );
    if (alreadyAllocated) {
      return res.status(409).json({
        success: false,
        message: 'This resource item has already been allocated to this request.',
      });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(resourceId);
    const filterQuery = isObjectId
      ? { _id: resourceId }
      : { $or: [{ id: resourceId }, { name: resourceId }] };

    // Inspect resource ownership: an NGO cannot allocate private inventory belonging to another NGO
    const resPreCheck = await Resource.findOne(filterQuery);
    if (!resPreCheck) {
      return res.status(404).json({ success: false, message: 'Resource not found in inventory.' });
    }

    if (req.user.role === 'ngo' && resPreCheck.organizationId && !resPreCheck.organizationId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot allocate inventory belonging to another organization.',
      });
    }

    // ATOMIC STOCK DEDUCTION (Guarantees no race condition and prevents negative inventory)
    const timestampStr = getFormattedTimestamp();

    const updatedResource = await Resource.findOneAndUpdate(
      {
        ...filterQuery,
        quantity: { $gte: qty },
        status: { $ne: 'Unavailable' },
      },
      {
        $inc: { quantity: -qty },
        $set: { lastUpdated: timestampStr },
      },
      { new: true }
    );

    if (!updatedResource) {
      if (resPreCheck.status === 'Unavailable') {
        return res.status(400).json({ success: false, message: 'This resource item is currently marked unavailable.' });
      }
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory: requested ${qty} ${resPreCheck.unit}, but only ${resPreCheck.quantity} available.`,
      });
    }

    // Update resource status based on remaining stock
    if (updatedResource.quantity === 0) {
      updatedResource.status = 'Critical';
      await updatedResource.save();
    } else if (updatedResource.quantity <= updatedResource.minThreshold) {
      updatedResource.status = 'Low Stock';
      await updatedResource.save();
    }

    // Set managing organization if not yet set
    if (!request.assignedOrganization || !request.assignedOrganization.id) {
      request.assignedOrganization = {
        id: req.user._id,
        name: req.user.name,
      };
    }

    // Append to request's allocated resources and timeline
    request.allocatedResources.push({
      resourceId: updatedResource._id,
      resourceName: updatedResource.name,
      category: updatedResource.category,
      quantity: qty,
      unit: updatedResource.unit,
      location: updatedResource.location,
      timestamp: timestampStr,
    });

    request.timeline.push({
      step: 'Resource Allocated',
      timestamp: timestampStr,
      note: `Allocated ${qty} ${updatedResource.unit} of ${updatedResource.name} from ${updatedResource.location}.`,
    });

    await request.save();

    // Notify citizen
    await notifyUser({
      userId: request.requester.userId,
      requestId: request.id,
      type: 'progress',
      title: 'Relief Resources Allocated',
      desc: `${qty} ${updatedResource.unit} of ${updatedResource.name} allocated to your request.`,
    });

    // Audit log
    await logAudit({
      actionType: 'RESOURCE_ALLOCATION',
      actor: req.user.name,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: request.id,
      targetType: 'Relief Inventory',
      details: `Allocated ${qty} ${updatedResource.unit} of "${updatedResource.name}" to request ${request.id}`,
    });

    res.status(200).json({
      success: true,
      remainingStock: updatedResource.quantity,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/requests/:id/flag
 * @desc    Flag or unflag request (Admin only)
 * @access  Private (Admin)
 */
export const flagRequest = async (req, res, next) => {
  try {
    const { isFlagged, reason } = req.body;
    const request = await findRequestByIdOrCustomId(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const timestampStr = getFormattedTimestamp();
    const flagStatus = Boolean(isFlagged);

    request.isFlagged = flagStatus;
    request.flagReason = flagStatus ? (reason || 'Flagged for moderation by administrator.') : null;
    request.flaggedAt = flagStatus ? timestampStr : null;

    await request.save();

    // Audit log
    await logAudit({
      actionType: flagStatus ? 'FLAG_REQUEST' : 'UNFLAG_REQUEST',
      actor: req.user.name,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: request.id,
      targetType: 'Assistance Request',
      details: flagStatus
        ? `Flagged as suspicious/duplicate. Reason: ${reason || 'Unspecified'}`
        : 'Moderation flag removed by administrator after review.',
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};
