export const mockDisasters = [
  {
    id: 'dis-2026-01',
    name: 'Konkan Coastal Monsoon Inundation & Flash Surge',
    type: 'Flood & Waterlogging',
    severity: 'Level 2 Regional Recovery',
    status: 'Active Recovery Phase',
    affectedRegions: ['Panvel', 'Navi Mumbai', 'Pen', 'Alibaug', 'Karjat'],
    startDate: 'September 28, 2026',
    coordinationLead: 'District Disaster Management Authority (DDMA) Raigad',
    activeRequestsCount: 142,
    resolvedRequestsCount: 389,
    participatingNGOs: 18,
    activeVolunteers: 245,
    summary: 'Heavy precipitation event caused coastal water backing and river swelling across Kalundre and Patalganga basins. Immediate emergency rescue has concluded; active focus is on water safety, sanitation, dry rations, and building restoration.'
  },
  {
    id: 'dis-2026-02',
    name: 'Western Ghats Landslip & Rural Cutoff Relief',
    type: 'Landslide Recovery',
    severity: 'Level 2 Sub-District',
    status: 'Stabilization & Reconnection',
    affectedRegions: ['Mahad', 'Poladpur', 'Khed'],
    startDate: 'September 22, 2026',
    coordinationLead: 'State Relief & Rehabilitation Division',
    activeRequestsCount: 68,
    resolvedRequestsCount: 174,
    participatingNGOs: 9,
    activeVolunteers: 110,
    summary: 'Secondary access roads now cleared by heavy machinery. Focus is on household repair materials, psychological counseling, and restoring rural solar power units.'
  }
];

export const recoveryPrinciples = [
  {
    title: 'Post-Emergency Focus',
    description: 'ResQConnect steps in when sirens stop. While 112/NDRF handles golden-hour rescue, we coordinate the grueling weeks and months of rebuilding lives, health, and dignity.'
  },
  {
    title: 'Zero Duplicate Allocation',
    description: 'Centralized request tracking ensures three different NGOs do not deliver rations to the same alley while adjacent streets remain unsupported.'
  },
  {
    title: 'Human-Led Verification',
    description: 'Every high-priority citizen request is reviewed by verified community coordinators or civil defense volunteers to preserve integrity and trust.'
  },
  {
    title: 'Dignified & Transparent',
    description: 'Citizens receive clear tracking of who is handling their request, expected delivery windows, and direct verification logs.'
  }
];
