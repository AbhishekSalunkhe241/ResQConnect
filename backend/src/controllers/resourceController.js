import Resource from '../models/Resource.js';
import { logAudit } from '../utils/auditLogger.js';
import { getFormattedTimestamp } from '../utils/requestIdGenerator.js';

/**
 * @route   GET /api/resources
 * @desc    Get all relief resources in inventory
 * @access  Public / Private
 */
export const getResources = async (req, res, next) => {
  try {
    const { category, status } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/resources
 * @desc    Create/Add a new resource to warehouse inventory
 * @access  Private (NGO, Admin)
 */
export const createResource = async (req, res, next) => {
  try {
    const { name, category, quantity, unit, minThreshold, location, organization, notes } = req.body;

    if (!name || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resource name and quantity.',
      });
    }

    const qty = Number(quantity);
    if (!Number.isSafeInteger(qty) || qty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative whole number.',
      });
    }

    const resource = await Resource.create({
      name: name.trim(),
      category: category || 'Food & Water',
      quantity: qty,
      unit: unit || 'units',
      minThreshold: Number(minThreshold) || 20,
      location: location || 'Panvel Central Depot',
      organization: organization || (req.user ? req.user.name : 'Helping Hands Foundation'),
      organizationId: req.user ? req.user._id : null,
      notes: notes || '',
    });

    // Audit log
    await logAudit({
      actionType: 'INVENTORY_ADD',
      actor: req.user.name,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: resource._id,
      targetType: 'Relief Inventory',
      details: `Added ${qty} ${resource.unit} of "${resource.name}" to inventory at ${resource.location}`,
    });

    res.status(201).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/resources/:id
 * @desc    Update resource quantity, status, or notes
 * @access  Private (NGO, Admin)
 */
export const updateResource = async (req, res, next) => {
  try {
    const { quantity, status, notes, minThreshold } = req.body;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found in inventory.',
      });
    }

    const timestampStr = getFormattedTimestamp();

    if (quantity !== undefined) {
      const qty = Number(quantity);
      if (!Number.isSafeInteger(qty) || qty < 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a non-negative whole number.',
        });
      }
      resource.quantity = qty;
    }

    if (minThreshold !== undefined) {
      resource.minThreshold = Number(minThreshold);
    }

    if (status !== undefined) {
      resource.status = status;
    }

    if (notes !== undefined) {
      resource.notes = notes;
    }

    resource.lastUpdated = timestampStr;
    await resource.save();

    // Audit log
    await logAudit({
      actionType: 'INVENTORY_UPDATE',
      actor: req.user.name,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: resource._id,
      targetType: 'Relief Inventory',
      details: `Updated inventory for "${resource.name}": quantity is now ${resource.quantity} ${resource.unit}, status "${resource.status}"`,
    });

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};
