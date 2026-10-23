import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Request from '../models/Request.js';
import Resource from '../models/Resource.js';
import RecoveryHub from '../models/RecoveryHub.js';
import AuditLog from '../models/AuditLog.js';
import { connectDB } from '../config/db.js';

import { mockRequests } from '../../../ResQConnect-main/src/data/mockRequests.js';
import { mockResources } from '../../../ResQConnect-main/src/data/mockResources.js';
import { mockRecoveryHubs } from '../../../ResQConnect-main/src/data/mockHubs.js';
import { mockAuditLogs } from '../../../ResQConnect-main/src/data/mockAuditLogs.js';

export const demoAccounts = [
  {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98201 44521',
    role: 'citizen',
    location: 'Panvel, Maharashtra',
    bio: 'Resident of Panvel coordinating local recovery needs.',
    verified: true,
    pendingVerification: false,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    name: 'Priya Mehta',
    email: 'priya.mehta@example.com',
    phone: '+91 98192 33412',
    role: 'volunteer',
    location: 'Navi Mumbai, Maharashtra',
    bio: 'Certified disaster response volunteer with community flood rehabilitation experience.',
    skills: ['First Aid & Triage', 'Clean Water Purification', 'Distribution Logistics'],
    status: 'Available',
    badge: 'Certified Responder',
    verified: true,
    pendingVerification: false,
    assignedTasksCount: 0,
    completedTasksCount: 14,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    name: 'Helping Hands Foundation',
    email: 'contact@helpinghands.org',
    phone: '+91 22 2745 8890',
    role: 'ngo',
    location: 'Raigad District, Maharashtra',
    bio: 'Relief NGO providing rapid procurement and distribution of shelter supplies.',
    regNumber: 'MAH-2018-NGO-4491',
    focusAreas: ['Shelter Rehabilitation', 'Emergency Rations', 'Water & Sanitation'],
    verified: true,
    pendingVerification: false,
    activeMissions: 14,
    completedMissions: 182,
    volunteersCount: 48,
    avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    name: 'System Administrator',
    email: 'admin@resqconnect.org',
    phone: '+91 22 2202 0101',
    role: 'admin',
    location: 'State Coordination Desk, Mumbai',
    department: 'Disaster Recovery Coordination Bureau',
    verified: true,
    pendingVerification: false,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80',
  },
];

/**
 * Seed initial database collections idempotently without overwriting
 */
export const seedDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('[Seeder Error] Database seeding is strictly prohibited in production mode.');
    return false;
  }

  const defaultPassword = process.env.DEMO_PASSWORD || 'ResQDemo@2026!';

  // 1. Seed demo users
  let usersCreated = 0;
  for (const acc of demoAccounts) {
    const exists = await User.findOne({ email: acc.email });
    if (!exists) {
      await User.create({ ...acc, password: defaultPassword });
      usersCreated++;
    }
  }

  const citizenUser = await User.findOne({ role: 'citizen' });
  const volunteerUser = await User.findOne({ role: 'volunteer' });

  // 2. Seed resources if collection is empty
  const resourceCount = await Resource.countDocuments();
  let resourcesCreated = 0;
  if (resourceCount === 0) {
    for (const r of mockResources) {
      await Resource.create({
        name: r.name,
        category: r.category,
        quantity: r.quantity,
        unit: r.unit,
        minThreshold: r.minThreshold,
        location: r.location,
        organization: r.organization,
        status: r.status,
        notes: r.notes || '',
      });
      resourcesCreated++;
    }
  }

  // 3. Seed recovery hubs if collection is empty
  const hubCount = await RecoveryHub.countDocuments();
  let hubsCreated = 0;
  if (hubCount === 0) {
    for (const h of mockRecoveryHubs) {
      await RecoveryHub.create({
        name: h.name,
        zone: h.zone,
        district: h.district,
        address: h.address,
        status: h.status,
        statusColor: h.statusColor,
        operatingHours: h.operatingHours,
        contactPerson: h.contactPerson,
        phone: h.phone,
        capacity: h.capacity,
        occupancyRate: h.occupancyRate,
        services: h.services,
        inventorySummary: h.inventorySummary,
        mapCoords: h.mapCoords,
        notes: h.notes || '',
      });
      hubsCreated++;
    }
  }

  // 4. Seed requests if collection is empty
  const requestCount = await Request.countDocuments();
  let requestsCreated = 0;
  if (requestCount === 0) {
    for (const reqItem of mockRequests) {
      await Request.create({
        id: reqItem.id,
        category: reqItem.category,
        priority: reqItem.priority,
        status: reqItem.status,
        title: reqItem.title,
        description: reqItem.description,
        location: reqItem.location,
        addressDetails: reqItem.addressDetails,
        peopleAffected: reqItem.peopleAffected,
        accessibility: reqItem.accessibility || 'None',
        additionalNotes: reqItem.additionalNotes || '',
        requester: {
          userId: citizenUser ? citizenUser._id : new mongoose.Types.ObjectId(),
          name: reqItem.requester.name,
          phone: reqItem.requester.phone,
          type: reqItem.requester.type,
          affectedCount: reqItem.requester.affectedCount,
        },
        assignedVolunteer: reqItem.assignedVolunteer
          ? {
              id: volunteerUser ? volunteerUser._id : new mongoose.Types.ObjectId(),
              name: reqItem.assignedVolunteer.name,
              phone: reqItem.assignedVolunteer.phone,
              badge: reqItem.assignedVolunteer.badge,
            }
          : null,
        itemsNeeded: reqItem.itemsNeeded,
        allocatedResources: reqItem.allocatedResources || [],
        timeline: reqItem.timeline,
        checkInNotes: reqItem.checkInNotes || [],
        completionNote: reqItem.completionNote || null,
        proofDescription: reqItem.proofDescription || null,
        completedAt: reqItem.completedAt || null,
      });
      requestsCreated++;
    }
  }

  // 5. Seed audit logs if empty
  const auditCount = await AuditLog.countDocuments();
  let auditCreated = 0;
  if (auditCount === 0) {
    for (const a of mockAuditLogs) {
      await AuditLog.create({
        actionType: a.actionType,
        actor: a.actor,
        actorRole: a.actorRole,
        targetId: a.targetId,
        targetType: a.targetType,
        details: a.details,
        timestamp: a.timestamp,
      });
      auditCreated++;
    }
  }

  console.log(
    `[Seeder] Seed complete: Users (${usersCreated} new), Resources (${resourcesCreated} new), Hubs (${hubsCreated} new), Requests (${requestsCreated} new), AuditLogs (${auditCreated} new).`
  );
  return { usersCreated, resourcesCreated, hubsCreated, requestsCreated, auditCreated };
};

// If run directly from CLI (e.g. `npm run seed`):
if (process.argv[1]?.endsWith('seeder.js')) {
  const isConnected = await connectDB();
  if (!isConnected) {
    console.error('[Seeder Error] Could not connect to MongoDB Atlas. Aborting.');
    process.exit(1);
  }

  try {
    await seedDatabase();
    console.log('[Seeder] Finished successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}
