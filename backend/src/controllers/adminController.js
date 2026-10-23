import User from '../models/User.js';
import Request from '../models/Request.js';
import Resource from '../models/Resource.js';
import RecoveryHub from '../models/RecoveryHub.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import { logAudit } from '../utils/auditLogger.js';
import { notifyUser } from '../utils/notificationHelper.js';
import { findRequestByIdOrCustomId } from './requestController.js';

/**
 * @route   GET /api/admin/users
 * @desc    List all registered users and pending verification queues
 * @access  Private (Admin)
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role, verified, search, pendingOnly } = req.query;
    let query = {};

    if (role && role !== 'All') {
      query.role = role.toLowerCase();
    }

    if (verified !== undefined && verified !== 'All') {
      query.verified = verified === 'true';
    }

    if (pendingOnly === 'true') {
      query.pendingVerification = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { regNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    const safeUsers = users.map((u) => u.toSafeObject());

    res.status(200).json({
      success: true,
      count: safeUsers.length,
      data: safeUsers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/users/:id/verify
 * @desc    Approve partner verification credentials (Volunteer or NGO)
 * @access  Private (Admin)
 */
export const verifyUser = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.verified = true;
    user.pendingVerification = false;
    user.verificationNotes = notes || 'Verified credentials approved by state administration.';

    if (user.role === 'volunteer') {
      user.status = 'Available';
      user.badge = 'Certified Responder';
    }

    await user.save();

    // Notify user
    await notifyUser({
      userId: user._id,
      type: 'verification',
      title: 'Account Verification Approved',
      desc: 'Your credentials have been approved by the administration desk. You may now participate in operations.',
    });

    // Audit log
    await logAudit({
      actionType: 'VERIFICATION_APPROVAL',
      actor: req.user.name,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: user._id,
      targetType: 'User Account',
      details: `Approved verification for ${user.role} "${user.name}". Notes: ${user.verificationNotes}`,
    });

    res.status(200).json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/users/:id/reject
 * @desc    Reject partner verification with reason
 * @access  Private (Admin)
 */
export const rejectUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.verified = false;
    user.pendingVerification = false;
    user.rejectionReason = reason || 'Documentation could not be authenticated by administrative desk.';

    await user.save();

    // Notify user
    await notifyUser({
      userId: user._id,
      type: 'verification',
      title: 'Verification Not Approved',
      desc: `Your verification was not approved: ${user.rejectionReason}`,
    });

    // Audit log
    await logAudit({
      actionType: 'VERIFICATION_REJECTED',
      actor: req.user.name,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: user._id,
      targetType: 'User Account',
      details: `Rejected verification for ${user.role} "${user.name}". Reason: ${user.rejectionReason}`,
    });

    res.status(200).json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Query immutable audit logs
 * @access  Private (Admin)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { actionType, actorRole, search } = req.query;
    let query = {};

    if (actionType && actionType !== 'All') {
      query.actionType = actionType;
    }

    if (actorRole && actorRole !== 'All') {
      query.actorRole = actorRole.toLowerCase();
    }

    if (search) {
      query.$or = [
        { details: { $regex: search, $options: 'i' } },
        { actor: { $regex: search, $options: 'i' } },
        { targetId: { $regex: search, $options: 'i' } },
      ];
    }

    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(200);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/reset-demo-data
 * @desc    Reset and reseed demo requests and resources (Development Mode Only)
 * @access  Private (Admin only, Disabled in Production)
 */
export const resetDemoData = async (req, res, next) => {
  try {
    // STRICT SECURITY GUARD
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Security violation: Database reset is permanently disabled in production mode.',
      });
    }

    // Clean demonstration collections without touching users
    await Request.deleteMany({});
    await Resource.deleteMany({});
    await RecoveryHub.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    // Import and seed default mock items
    const { mockRequests } = await import('../../../ResQConnect-main/src/data/mockRequests.js');
    const { mockResources } = await import('../../../ResQConnect-main/src/data/mockResources.js');
    const { mockRecoveryHubs } = await import('../../../ResQConnect-main/src/data/mockHubs.js');

    // Seed requests
    const adminUser = await User.findOne({ role: 'admin' });
    const citizenUser = await User.findOne({ role: 'citizen' });

    for (const r of mockRequests) {
      await Request.create({
        ...r,
        requester: {
          ...r.requester,
          userId: citizenUser ? citizenUser._id : adminUser._id,
        },
      });
    }

    // Seed resources
    for (const resItem of mockResources) {
      await Resource.create(resItem);
    }

    // Seed hubs
    for (const hub of mockRecoveryHubs) {
      await RecoveryHub.create(hub);
    }

    // Record audit log
    await logAudit({
      actionType: 'DEMO_DATA_RESET',
      actor: req.user.name,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: 'ALL',
      targetType: 'Database State',
      details: 'Demo data reset and reseeded with default state.',
    });

    res.status(200).json({
      success: true,
      message: 'Demo dataset successfully reset and reseeded.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/export/csv
 * @desc    Export requests dataset as downloadable CSV with filters (Admin only)
 * @access  Private (Admin)
 */
export const exportRequestsCsv = async (req, res, next) => {
  try {
    const { category, priority, status } = req.query;
    let query = {};

    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;
    if (status && status !== 'All') query.status = status;

    const requests = await Request.find(query).sort({ createdAt: -1 });

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const headers = [
      'Request ID',
      'Title',
      'Category',
      'Priority',
      'Status',
      'Requester Name',
      'Requester Phone',
      'Location',
      'People Affected',
      'Accessibility',
      'Assigned Volunteer',
      'Assigned Organization',
      'Created At',
      'Completed At',
    ];

    const rows = requests.map((r) => [
      escapeCsv(r.id),
      escapeCsv(r.title),
      escapeCsv(r.category),
      escapeCsv(r.priority),
      escapeCsv(r.status),
      escapeCsv(r.requester?.name || 'Anonymous'),
      escapeCsv(r.requester?.phone || ''),
      escapeCsv(r.location),
      escapeCsv(r.peopleAffected || 1),
      escapeCsv(r.accessibility || 'None'),
      escapeCsv(r.assignedVolunteer?.name || 'Unassigned'),
      escapeCsv(r.assignedOrganization?.name || 'None'),
      escapeCsv(r.createdAt ? r.createdAt.toISOString() : ''),
      escapeCsv(r.completedAt || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ResQConnect_Requests_${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
