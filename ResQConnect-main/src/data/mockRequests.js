export const mockRequests = [
  {
    id: 'RQ-1025',
    category: 'Transportation',
    priority: 'Medium',
    status: 'Submitted',
    title: 'Displacement Transit for 3 Senior Citizens from Low-Lying Zone',
    description: 'Require safe transport from waterlogged ground-floor tenements in Old Panvel to elevated dry community shelter near Shivaji Chowk.',
    location: 'Sector 3, Old Panvel, Maharashtra, 410206',
    addressDetails: {
      address: 'Near Old Shivaji Chowk, Lane 4',
      city: 'Panvel',
      state: 'Maharashtra',
      postalCode: '410206'
    },
    peopleAffected: 3,
    accessibility: 'Wheelchair / Senior Mobility Assistance',
    additionalNotes: 'Narrow access road with knee-deep water; high-clearance van or ambulance preferred.',
    createdAt: '2026-10-06T10:15:00Z',
    requester: {
      name: 'Rahul Sharma',
      phone: '+91 98201 44521',
      type: 'Citizen',
      affectedCount: 3
    },
    assignedOrganization: null,
    assignedVolunteer: null,
    estimatedAssistance: null,
    itemsNeeded: [
      { item: 'High-clearance evacuation van', qty: 1, unit: 'vehicle' },
      { item: 'Wheelchair assistance kits', qty: 2, unit: 'kits' }
    ],
    timeline: [
      { step: 'Submitted', timestamp: 'Oct 06, 10:15 AM', note: 'Request lodged via Citizen Portal with geotagged address.' }
    ]
  },
  {
    id: 'RQ-1024',
    category: 'Food & Water',
    priority: 'High',
    status: 'Under Verification',
    title: 'Clean Drinking Water & Dry Ration Kits for Displaced Households',
    description: 'Post-flood contamination of municipal supply in Sector 12. Urgent need for 200L potable water canisters and non-perishable grain rations for displaced households currently housed in community hall.',
    location: 'Sector 12, Panvel, Maharashtra, 410206',
    addressDetails: {
      address: 'Community Hall, Sector 12',
      city: 'Panvel',
      state: 'Maharashtra',
      postalCode: '410206'
    },
    peopleAffected: 42,
    accessibility: 'Infant care kits required for 4 nursing mothers',
    additionalNotes: 'Municipal tap water has silt intrusion. Boil water advisory issued.',
    createdAt: '2026-10-05T09:30:00Z',
    requester: {
      name: 'Rahul Sharma',
      phone: '+91 98201 44521',
      type: 'Community Representative',
      affectedCount: 42
    },
    assignedOrganization: null,
    assignedVolunteer: null,
    estimatedAssistance: null,
    itemsNeeded: [
      { item: 'Potable Drinking Water Cans (20L)', qty: 40, unit: 'cans' },
      { item: 'Dry Food Rations (Rice, Dal, Oil)', qty: 40, unit: 'kits' },
      { item: 'Water Purification Chlorine Tablets', qty: 100, unit: 'strips' }
    ],
    timeline: [
      { step: 'Submitted', timestamp: 'Oct 05, 09:30 AM', note: 'Request lodged via Citizen Portal with geotagged community center.' },
      { step: 'Under Verification', timestamp: 'Oct 05, 11:15 AM', note: 'Local field coordinator assigned for rapid telephone & neighborhood validation.' }
    ]
  },
  {
    id: 'RQ-1023',
    category: 'Household Supplies',
    priority: 'Medium',
    status: 'Verified',
    title: 'Emergency Rechargeable Lanterns & Basic Cooking Sets',
    description: 'Power grid sub-station inundated along creek bank. 15 families require emergency lighting and portable single-burner stove units for infant meals.',
    location: 'Revdanda, Alibag, Maharashtra, 402201',
    addressDetails: {
      address: 'Lane 2, Near Fish Market',
      city: 'Alibag',
      state: 'Maharashtra',
      postalCode: '402201'
    },
    peopleAffected: 15,
    accessibility: 'None',
    additionalNotes: 'Grid restoration estimated in 48-72 hours.',
    createdAt: '2026-10-04T15:20:00Z',
    requester: {
      name: 'Rahul Sharma',
      phone: '+91 98201 44521',
      type: 'Citizen',
      affectedCount: 15
    },
    assignedOrganization: null,
    assignedVolunteer: null,
    estimatedAssistance: 'Awaiting relief partner matching',
    itemsNeeded: [
      { item: 'Solar Rechargeable Lanterns', qty: 15, unit: 'units' },
      { item: 'Portable Cooking Gas Canisters', qty: 15, unit: 'canisters' }
    ],
    timeline: [
      { step: 'Submitted', timestamp: 'Oct 04, 03:20 PM', note: 'Request logged for off-grid lighting assistance.' },
      { step: 'Under Verification', timestamp: 'Oct 04, 04:45 PM', note: 'Field validation confirmed by village sarpanch desk.' },
      { step: 'Verified', timestamp: 'Oct 05, 09:00 AM', note: 'Need verified as priority non-food recovery item. Ready for NGO matching.' }
    ]
  },
  {
    id: 'RQ-1022',
    category: 'Shelter',
    priority: 'High',
    status: 'Matched',
    title: 'Heavy-Duty Tarpaulin Sheets & Dry Ground Mats for Sloped Huts',
    description: 'Roofing tin ripped off during heavy squall. Rain continues to compromise interior living rooms. Need durable weatherproofing sheets to preserve belongings.',
    location: 'Khandala Road, Karjat, Maharashtra, 410201',
    addressDetails: {
      address: 'Survey 44, Khandala Ghat Road',
      city: 'Karjat',
      state: 'Maharashtra',
      postalCode: '410201'
    },
    peopleAffected: 8,
    accessibility: 'Elderly resident with restricted mobility',
    additionalNotes: 'Assigned NGO warehouse in Panvel preparing dispatch.',
    createdAt: '2026-10-04T08:00:00Z',
    requester: {
      name: 'Rahul Sharma',
      phone: '+91 98201 44521',
      type: 'Citizen',
      affectedCount: 8
    },
    assignedOrganization: {
      id: 'org-1',
      name: 'Helping Hands Foundation',
      contactPerson: 'Karan Deshmukh',
      phone: '+91 22 2745 8890',
      badge: 'Tier 1 Verified NGO'
    },
    assignedVolunteer: {
      id: 'vol-1',
      name: 'Priya Mehta',
      phone: '+91 98192 33412',
      badge: 'Certified Responder'
    },
    estimatedAssistance: 'Within 24 hours',
    itemsNeeded: [
      { item: 'Heavy-Duty Waterproof Tarpaulin (24x18 ft)', qty: 6, unit: 'sheets' },
      { item: 'Waterproof Ground Bedding Mats', qty: 8, unit: 'mats' },
      { item: 'Fastening Ropes & Pegs', qty: 4, unit: 'bundles' }
    ],
    timeline: [
      { step: 'Submitted', timestamp: 'Oct 04, 08:00 AM', note: 'Request lodged with roof damage photos.' },
      { step: 'Under Verification', timestamp: 'Oct 04, 09:30 AM', note: 'Taluka relief officer confirmed roof displacement.' },
      { step: 'Verified', timestamp: 'Oct 04, 11:00 AM', note: 'Verified and queued for inventory allocation.' },
      { step: 'Matched', timestamp: 'Oct 04, 02:30 PM', note: 'Matched with Helping Hands Foundation; volunteer Priya Mehta assigned.' }
    ]
  },
  {
    id: 'RQ-1021',
    category: 'Medical Assistance',
    priority: 'Critical',
    status: 'Assistance In Progress',
    title: 'Post-Flood Chronic Care Refills & Sterile First Aid Dressings',
    description: 'Elderly citizens displaced from low-lying areas have run out of essential diabetes and hypertension prescriptions. Minor water-borne lacerations require sterile dressings and antiseptics.',
    location: 'Sector 4, Navi Mumbai, Maharashtra, 400703',
    addressDetails: {
      address: 'Plot 18, Sector 4, Vashi Bridge Approach',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      postalCode: '400703'
    },
    peopleAffected: 18,
    accessibility: 'Elderly assistance & insulin cold-storage preservation needed',
    additionalNotes: 'Mobile dispensary unit en route.',
    createdAt: '2026-10-03T14:15:00Z',
    requester: {
      name: 'Rahul Sharma',
      phone: '+91 98201 44521',
      type: 'Neighborhood Resident',
      affectedCount: 18
    },
    assignedOrganization: {
      id: 'org-2',
      name: 'Seva Medical Relief Corps',
      contactPerson: 'Dr. Anita Joshi',
      phone: '+91 22 2770 1212',
      badge: 'Verified Health Partner'
    },
    assignedVolunteer: {
      id: 'vol-2',
      name: 'Dr. Anita Joshi',
      phone: '+91 22 2770 1212',
      badge: 'Medical Officer'
    },
    estimatedAssistance: 'Within 2 hours',
    itemsNeeded: [
      { item: 'First-aid & antiseptic wound kits', qty: 25, unit: 'kits' },
      { item: 'Chronic disease refill packs (BP/Diabetes)', qty: 15, unit: 'packs' },
      { item: 'ORS Electrolyte Packets', qty: 150, unit: 'packets' }
    ],
    timeline: [
      { step: 'Submitted', timestamp: 'Oct 03, 02:15 PM', note: 'Request logged for medical triage support.' },
      { step: 'Under Verification', timestamp: 'Oct 03, 02:50 PM', note: 'Phone verification completed with attending doctor.' },
      { step: 'Verified', timestamp: 'Oct 03, 03:45 PM', note: 'Verified by Taluka Medical Officer.' },
      { step: 'Matched', timestamp: 'Oct 03, 05:00 PM', note: 'Assigned to Seva Medical Relief Corps mobile ambulance unit.' },
      { step: 'Assistance In Progress', timestamp: 'Oct 04, 08:30 AM', note: 'Medical team on ground conducting health checks and dispensing medications.' }
    ]
  },
  {
    id: 'RQ-1020',
    category: 'Clothing',
    priority: 'Low',
    status: 'Completed',
    title: 'Dry Clothing Sets & Childrens Warm Wear Post-Inundation',
    description: 'Mud deposits destroyed clothing storage trunks in ground-floor houses. Need clean everyday clothes and dry footwear for school-age children.',
    location: 'Roha Market Road, Roha, Maharashtra, 402109',
    addressDetails: {
      address: 'Roha Market Road, Ward 2',
      city: 'Roha',
      state: 'Maharashtra',
      postalCode: '402109'
    },
    peopleAffected: 12,
    accessibility: 'None',
    additionalNotes: 'Received dry boxes on Oct 03; signed acknowledgment submitted.',
    createdAt: '2026-10-01T11:00:00Z',
    requester: {
      name: 'Rahul Sharma',
      phone: '+91 98201 44521',
      type: 'Citizen',
      affectedCount: 12
    },
    assignedOrganization: {
      id: 'org-3',
      name: 'Community Care Alliance',
      contactPerson: 'Sanjay Shinde',
      phone: '+91 22 2899 4432',
      badge: 'Verified Regional NGO'
    },
    assignedVolunteer: {
      id: 'vol-3',
      name: 'Anil Patil',
      phone: '+91 98334 11223',
      badge: 'Field Volunteer'
    },
    estimatedAssistance: 'Delivered',
    itemsNeeded: [
      { item: 'Children Clothing Assortments', qty: 8, unit: 'sets' },
      { item: 'Adult Dry Garment Bundles', qty: 10, unit: 'sets' },
      { item: 'Rainproof Footwear Pairs', qty: 12, unit: 'pairs' }
    ],
    timeline: [
      { step: 'Submitted', timestamp: 'Oct 01, 11:00 AM', note: 'Request lodged for family garments.' },
      { step: 'Under Verification', timestamp: 'Oct 01, 12:30 PM', note: 'Verified by Roha Municipal ward officer.' },
      { step: 'Verified', timestamp: 'Oct 01, 02:00 PM', note: 'Approved for NGO fulfillment.' },
      { step: 'Matched', timestamp: 'Oct 01, 04:15 PM', note: 'Matched with Community Care Alliance.' },
      { step: 'Assistance In Progress', timestamp: 'Oct 02, 10:00 AM', note: 'Relief van dispatched from Alibag central warehouse.' },
      { step: 'Completed', timestamp: 'Oct 03, 03:30 PM', note: 'Handed over directly to families with photo verification.' }
    ]
  },
  {
    id: 'RQ-1018',
    category: 'Shelter',
    priority: 'Medium',
    status: 'Completed',
    title: 'Waterproof Tarpaulins & Emergency Bedding Kits',
    description: 'Severe roof tile damage from high velocity winds during cyclone landfall. Rainwater seeped into living quarters. Temporary heavy-duty waterproof tarpaulins and dry sleeping mats required.',
    location: 'Pen Taluka, Raigad, Maharashtra, 402107',
    addressDetails: {
      address: 'Village Neral, Pen Taluka',
      city: 'Pen',
      state: 'Maharashtra',
      postalCode: '402107'
    },
    peopleAffected: 6,
    accessibility: 'None',
    additionalNotes: 'Repairs completed on temporary roof structure.',
    createdAt: '2026-09-29T10:00:00Z',
    requester: {
      name: 'Rahul Sharma',
      phone: '+91 98201 44521',
      type: 'Citizen',
      affectedCount: 6
    },
    assignedOrganization: {
      id: 'org-1',
      name: 'Helping Hands Foundation',
      contactPerson: 'Karan Deshmukh',
      phone: '+91 22 2745 8890',
      badge: 'Tier 1 Verified NGO'
    },
    assignedVolunteer: {
      id: 'vol-1',
      name: 'Priya Mehta',
      phone: '+91 98192 33412',
      badge: 'Certified Responder'
    },
    estimatedAssistance: 'Delivered',
    itemsNeeded: [
      { item: 'Heavy-duty Tarpaulin Sheets (18x24 ft)', qty: 4, unit: 'sheets' },
      { item: 'Waterproof Ground Mats & Blankets', qty: 8, unit: 'mats' }
    ],
    timeline: [
      { step: 'Submitted', timestamp: 'Sep 29, 10:00 AM', note: 'Request filed with shelter damage photos.' },
      { step: 'Under Verification', timestamp: 'Sep 29, 10:45 AM', note: 'Desk verification initiated.' },
      { step: 'Verified', timestamp: 'Sep 29, 11:30 AM', note: 'Verification confirmed by village revenue assistant.' },
      { step: 'Matched', timestamp: 'Sep 29, 01:00 PM', note: 'Helping Hands Foundation allocated warehouse stock.' },
      { step: 'Assistance In Progress', timestamp: 'Sep 30, 09:00 AM', note: 'Delivery truck dispatched from Panvel logistics hub.' },
      { step: 'Completed', timestamp: 'Sep 30, 04:30 PM', note: 'Handed over to family with signed acknowledgment receipt.' }
    ]
  },
  {
    id: 'RQ-1015',
    category: 'Household Supplies',
    priority: 'Low',
    status: 'Closed',
    title: 'Disinfectant Sprays, Lime Powder & Family Hygiene Kits',
    description: 'Receding floodwaters left silt and stagnant water pools in residential alleyways. Lime powder and bleaching agents required to prevent vector and waterborne contamination.',
    location: 'Karjat Central, Maharashtra, 410201',
    addressDetails: {
      address: 'Main Bazaar Road, Karjat Central',
      city: 'Karjat',
      state: 'Maharashtra',
      postalCode: '410201'
    },
    peopleAffected: 30,
    accessibility: 'None',
    additionalNotes: 'Municipal health department took over full area sanitization.',
    createdAt: '2026-09-25T16:20:00Z',
    requester: {
      name: 'Rahul Sharma',
      phone: '+91 98201 44521',
      type: 'Resident Welfare Committee',
      affectedCount: 30
    },
    assignedOrganization: null,
    assignedVolunteer: null,
    estimatedAssistance: 'Closed by municipal authority',
    itemsNeeded: [
      { item: 'Bleaching Powder & Lime Bags (25kg)', qty: 10, unit: 'bags' },
      { item: 'Family Hygiene Packets (Soap, Sanitizer, Napkins)', qty: 35, unit: 'packets' }
    ],
    timeline: [
      { step: 'Submitted', timestamp: 'Sep 25, 04:20 PM', note: 'Community request submitted.' },
      { step: 'Under Verification', timestamp: 'Sep 26, 09:15 AM', note: 'Forwarded to Municipal Health Dept.' },
      { step: 'Verified', timestamp: 'Sep 26, 10:00 AM', note: 'Verified by Municipal Sanitation Inspector.' },
      { step: 'Closed', timestamp: 'Sep 28, 05:00 PM', note: 'Municipal spray drive executed across Karjat wards. Request marked closed.' }
    ]
  }
];

export const CATEGORIES_CONFIG = [
  {
    name: 'Food & Water',
    defaultItems: [
      { item: 'Clean Drinking Water Cans (20L)', defaultQty: 20, unit: 'cans' },
      { item: 'Dry Ration Food Kits', defaultQty: 5, unit: 'kits' },
      { item: 'Baby Milk Formula Packs', defaultQty: 3, unit: 'packs' }
    ]
  },
  {
    name: 'Medical Assistance',
    defaultItems: [
      { item: 'Sterile First Aid & Wound Kits', defaultQty: 4, unit: 'kits' },
      { item: 'Chronic Medication Refill Packs', defaultQty: 2, unit: 'packs' },
      { item: 'ORS Electrolyte Solution Packets', defaultQty: 25, unit: 'packets' }
    ]
  },
  {
    name: 'Shelter',
    defaultItems: [
      { item: 'Heavy-Duty Tarpaulin Sheets (18x24 ft)', defaultQty: 4, unit: 'sheets' },
      { item: 'Emergency Sleeping Blankets', defaultQty: 6, unit: 'blankets' },
      { item: 'Waterproof Ground Mats', defaultQty: 4, unit: 'mats' }
    ]
  },
  {
    name: 'Clothing',
    defaultItems: [
      { item: 'Emergency Clothing Sets', defaultQty: 5, unit: 'sets' },
      { item: 'Rainproof Jackets / Ponchos', defaultQty: 4, unit: 'units' },
      { item: 'Durable Footwear Pairs', defaultQty: 4, unit: 'pairs' }
    ]
  },
  {
    name: 'Transportation',
    defaultItems: [
      { item: 'Emergency Relocation Transit', defaultQty: 1, unit: 'vehicle' },
      { item: 'Mobility / Wheelchair Transport', defaultQty: 1, unit: 'trip' }
    ]
  },
  {
    name: 'Household Supplies',
    defaultItems: [
      { item: 'Emergency Solar Lanterns', defaultQty: 3, unit: 'units' },
      { item: 'Family Hygiene & Soap Kits', defaultQty: 4, unit: 'kits' },
      { item: 'Portable Cooking Gas Canisters', defaultQty: 2, unit: 'canisters' }
    ]
  },
  {
    name: 'Financial Assistance',
    defaultItems: [
      { item: 'Emergency Recovery Essential Voucher', defaultQty: 1, unit: 'voucher' }
    ]
  },
  {
    name: 'Other',
    defaultItems: [
      { item: 'Specific Assistance Item', defaultQty: 1, unit: 'units' }
    ]
  }
];

export const STATUS_STEPS = [
  'Submitted',
  'Under Verification',
  'Verified',
  'Matched',
  'Assistance In Progress',
  'Completed',
  'Closed'
];

export const STATUS_INFO = {
  'Submitted': {
    label: 'Submitted',
    badge: 'blue',
    description: 'Your request has been submitted and is currently queued for intake.'
  },
  'Under Verification': {
    label: 'Under Verification',
    badge: 'amber',
    description: 'Your request has been submitted and is currently being reviewed. Once verified, the system can match it with available organizations or volunteers.'
  },
  'Verified': {
    label: 'Verified',
    badge: 'teal',
    description: 'Your request has been verified and is ready for matching.'
  },
  'Matched': {
    label: 'Matched',
    badge: 'purple',
    description: 'A recovery organization has been matched to your request.'
  },
  'Assistance In Progress': {
    label: 'Assistance In Progress',
    badge: 'blue',
    description: 'Assistance is currently being coordinated.'
  },
  'Completed': {
    label: 'Completed',
    badge: 'green',
    description: 'The requested assistance has been completed.'
  },
  'Closed': {
    label: 'Closed',
    badge: 'slate',
    description: 'This request has been resolved and closed.'
  }
};

export const mockCategories = [
  { id: 'water-food', name: 'Food & Water', icon: 'Droplets', description: 'Clean drinking water, non-perishable rations, baby formula' },
  { id: 'medical', name: 'Medical Assistance', icon: 'HeartPulse', description: 'Essential prescription refills, first aid, trauma supplies' },
  { id: 'shelter', name: 'Shelter', icon: 'Home', description: 'Tarpaulins, emergency bedding, structural stabilization tools' },
  { id: 'clothing', name: 'Clothing', icon: 'Shirt', description: 'Dry clothing sets, weather footwear, rainproof ponchos' },
  { id: 'transportation', name: 'Transportation', icon: 'Truck', description: 'Emergency relocation transport, mobility transit' },
  { id: 'supplies', name: 'Household Supplies', icon: 'Sparkles', description: 'Solar lamps, hygiene packets, cooking sets' },
];

export const requestStatusList = [
  { key: 'Submitted', label: 'Submitted', color: 'blue', desc: 'Request logged into ResQConnect registry' },
  { key: 'Under Verification', label: 'Under Verification', color: 'amber', desc: 'Field coordinator validating need & location' },
  { key: 'Verified', label: 'Verified', color: 'teal', desc: 'Validated by local authorities or field team' },
  { key: 'Matched', label: 'Matched', color: 'indigo', desc: 'Assigned to qualified relief NGO or volunteer group' },
  { key: 'Assistance In Progress', label: 'In Progress', color: 'purple', desc: 'Resources dispatched or team on site' },
  { key: 'Completed', label: 'Completed', color: 'green', desc: 'Assistance delivered and signed off' },
  { key: 'Closed', label: 'Closed', color: 'slate', desc: 'Request fulfilled or resolved' }
];

