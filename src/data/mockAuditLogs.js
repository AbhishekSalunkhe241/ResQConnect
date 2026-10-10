export const mockAuditLogs = [
  {
    id: 'audit-1',
    timestamp: 'Oct 06, 01:15 PM',
    actionType: 'VOLUNTEER_ASSIGN',
    actor: 'Helping Hands Foundation (NGO)',
    actorRole: 'ngo',
    targetId: 'RQ-1022',
    targetType: 'Assistance Request',
    details: 'Volunteer Priya Mehta assigned to high-priority shelter tarpaulin mission in Karjat.'
  },
  {
    id: 'audit-2',
    timestamp: 'Oct 06, 12:40 PM',
    actionType: 'RESOURCE_ALLOCATION',
    actor: 'Helping Hands Foundation (NGO)',
    actorRole: 'ngo',
    targetId: 'RQ-1024',
    targetType: 'Relief Inventory',
    details: 'Allocated 40 cans of 20L Potable Water to Sector 12 Panvel Displaced Community Hall.'
  },
  {
    id: 'audit-3',
    timestamp: 'Oct 06, 11:15 AM',
    actionType: 'VERIFICATION_APPROVAL',
    actor: 'State Coordination Desk (Admin)',
    actorRole: 'admin',
    targetId: 'org-3',
    targetType: 'Relief Organization',
    details: 'Accredited Maharashtra Disaster Resilience Trust as Tier 1 Sanitation Partner.'
  },
  {
    id: 'audit-4',
    timestamp: 'Oct 06, 10:20 AM',
    actionType: 'STATUS_CHANGE',
    actor: 'Field Coordinator Desk',
    actorRole: 'ngo',
    targetId: 'RQ-1023',
    targetType: 'Assistance Request',
    details: 'Status advanced from "Under Verification" to "Verified" after sarpanch confirmation.'
  },
  {
    id: 'audit-5',
    timestamp: 'Oct 05, 05:45 PM',
    actionType: 'FLAG_REQUEST',
    actor: 'System Administrator (Admin)',
    actorRole: 'admin',
    targetId: 'RQ-1017',
    targetType: 'Assistance Request',
    details: 'Flagged as potential duplicate submission within same 15-minute window.'
  },
  {
    id: 'audit-6',
    timestamp: 'Oct 05, 03:30 PM',
    actionType: 'INVENTORY_UPDATE',
    actor: 'Helping Hands Warehouse Manager',
    actorRole: 'ngo',
    targetId: 'res-3',
    targetType: 'Inventory Item',
    details: 'Restocked 50 reinforced tarpaulins at Karjat Foothills Relief Hub.'
  }
];
