import RecoveryHub from '../models/RecoveryHub.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * @route   GET /api/hubs
 * @desc    Get all recovery hubs with directory search & filter
 * @access  Public
 */
export const getHubs = async (req, res, next) => {
  try {
    const { status, zone, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (zone && zone !== 'All') {
      query.zone = { $regex: zone, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { zone: { $regex: search, $options: 'i' } },
      ];
    }

    const hubs = await RecoveryHub.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: hubs.length,
      data: hubs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/hubs
 * @desc    Create a new recovery hub
 * @access  Private (Admin)
 */
export const createHub = async (req, res, next) => {
  try {
    const {
      name,
      zone,
      district,
      address,
      status,
      statusColor,
      operatingHours,
      contactPerson,
      phone,
      capacity,
      occupancyRate,
      services,
      inventorySummary,
      mapCoords,
      notes,
    } = req.body;

    if (!name || !zone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, zone, and address for the recovery hub.',
      });
    }

    const hub = await RecoveryHub.create({
      name: name.trim(),
      zone: zone.trim(),
      district: district || 'Raigad District',
      address: address.trim(),
      status: status || 'Operational',
      statusColor: statusColor || 'green',
      operatingHours: operatingHours || '08:00 AM - 08:00 PM (Daily)',
      contactPerson: contactPerson || '',
      phone: phone || '',
      capacity: capacity || '200 Persons Capacity',
      occupancyRate: Number(occupancyRate) || 50,
      services: Array.isArray(services) ? services : [],
      inventorySummary: inventorySummary || '',
      mapCoords: mapCoords || { x: 50, y: 50 },
      notes: notes || '',
    });

    if (req.user) {
      await logAudit({
        actionType: 'HUB_CREATED',
        actor: req.user.name,
        actorId: req.user._id,
        actorRole: req.user.role,
        targetId: hub._id,
        targetType: 'Recovery Hub',
        details: `Created recovery hub: "${hub.name}" in ${hub.zone}`,
      });
    }

    res.status(201).json({
      success: true,
      data: hub,
    });
  } catch (error) {
    next(error);
  }
};
