import AuditLog from '../models/AuditLog.js';

/**
 * Creates an immutable audit log entry in MongoDB
 */
export const logAudit = async ({
  actionType,
  actor,
  actorId = null,
  actorRole = 'system',
  targetId,
  targetType,
  details,
}) => {
  try {
    const entry = await AuditLog.create({
      actionType,
      actor: actor || 'System Desk',
      actorId,
      actorRole,
      targetId: String(targetId),
      targetType,
      details,
    });
    return entry;
  } catch (err) {
    // Audit log failure should be logged but never crash the primary business operation
    console.error('[AuditLog Error] Failed to record audit log:', err.message);
    return null;
  }
};
