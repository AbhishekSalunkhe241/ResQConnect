export const mockRecoveryHubs = [
  {
    id: 'hub-1',
    name: 'Panvel Central Civic Recovery Hub',
    zone: 'Panvel Urban',
    district: 'Raigad District',
    address: 'Old Shivaji Chowk Community Complex, Sector 4, Panvel, 410206',
    status: 'Operational',
    statusColor: 'green',
    operatingHours: '08:00 AM - 08:00 PM (Daily)',
    contactPerson: 'Suresh Patil (Site In-charge)',
    phone: '+91 22 2745 4401 (Demo Desk)',
    capacity: '250 Persons Capacity',
    occupancyRate: 64,
    services: [
      'Clean Drinking Water Refill',
      'Dry Ration Distribution',
      'Outpatient First-Aid & Triage',
      'Citizen Assistance Desk',
      'Volunteer Dispatch Terminal'
    ],
    inventorySummary: '140 Water Cans, 95 Food Kits, 45 First-Aid Boxes',
    mapCoords: { x: 42, y: 35 }, // percentage on schematic map
    notes: 'Primary urban transit hub. Accessible by public bus line 12.'
  },
  {
    id: 'hub-2',
    name: 'Karjat Foothills Rehabilitation Center',
    zone: 'Karjat Rural',
    district: 'Raigad District',
    address: 'Survey 18, Khandala Ghat Road, Near Karjat Railway Junction, 410201',
    status: 'High Demand',
    statusColor: 'amber',
    operatingHours: '24/7 Operations',
    contactPerson: 'Dr. Anita Joshi (Medical Lead)',
    phone: '+91 2148 223011 (Demo Desk)',
    capacity: '180 Persons Capacity',
    occupancyRate: 88,
    services: [
      'Emergency Tarpaulin Dispensation',
      'Mobile Medical Dispensary',
      'Infant Nutrition Station',
      'Structural Safety Advisory Desk'
    ],
    inventorySummary: '18 Tarpaulins (Restocking), 35 Foam Bedding, 50 Oral Rehydration Kits',
    mapCoords: { x: 78, y: 48 },
    notes: 'Handles hillside villages cut off by waterlogged secondary trails.'
  },
  {
    id: 'hub-3',
    name: 'Alibag Coastal Resilience Depot',
    zone: 'Alibag Coastline',
    district: 'Raigad District',
    address: 'Fish Market Road, Revdanda Jetty Sector, Alibag, 402201',
    status: 'Operational',
    statusColor: 'green',
    operatingHours: '09:00 AM - 07:00 PM',
    contactPerson: 'Karan Deshmukh (Relief Director)',
    phone: '+91 2141 252109 (Demo Desk)',
    capacity: '120 Persons Capacity',
    occupancyRate: 52,
    services: [
      'Solar Lantern Charging Station',
      'Water Purification Chlorine Distribution',
      'Clothing & Dry Footwear Sets',
      'Household Dignity Kits'
    ],
    inventorySummary: '14 Solar Lamps, 280 Chlorine Strips, 40 Clothing Packs',
    mapCoords: { x: 22, y: 72 },
    notes: 'Off-grid coastal staging area equipped with rooftop solar generators.'
  },
  {
    id: 'hub-4',
    name: 'Pen Patalganga Basin Aid Hub',
    zone: 'Pen Industrial Belt',
    district: 'Raigad District',
    address: 'Near Municipal High School Ground, Pen Main Road, 402107',
    status: 'Restocking',
    statusColor: 'blue',
    operatingHours: '08:30 AM - 06:30 PM',
    contactPerson: 'Vikram Salve (Sanitation Coordinator)',
    phone: '+91 2143 252340 (Demo Desk)',
    capacity: '150 Persons Capacity',
    occupancyRate: 40,
    services: [
      'Well Disinfection Chemicals',
      'Silt Shovel & De-watering Pumps',
      'Family Hygiene Buckets',
      'Displacement Transit Staging'
    ],
    inventorySummary: '85 Hygiene Kits, 60 Ground Mats, 20 Water Pumps on dispatch',
    mapCoords: { x: 50, y: 62 },
    notes: 'Specializes in silt clearing, disinfection, and vector-borne illness prevention.'
  },
  {
    id: 'hub-5',
    name: 'Navi Mumbai Regional Logistics Staging Base',
    zone: 'CBD Belapur / Vashi',
    district: 'Thane / Navi Mumbai',
    address: 'APMC Terminal 3, Vashi Sector 19, Navi Mumbai, 400703',
    status: 'Operational',
    statusColor: 'green',
    operatingHours: '24/7 Supply Staging',
    contactPerson: 'Sameer Gaikwad (Logistics Marshal)',
    phone: '+91 22 2789 9090 (Demo Desk)',
    capacity: '500 Persons Staging',
    occupancyRate: 35,
    services: [
      'High-Clearance Transit Fleet',
      'Inter-Agency Warehousing',
      'State DDMA Liaison Terminal',
      'Bulk Medical Supplies Intake'
    ],
    inventorySummary: '3 High-Clearance Vans, 450 Rations, Bulk Chlorine & IV Saline',
    mapCoords: { x: 34, y: 20 },
    notes: 'Macro receiving depot linking state highway deliveries to regional relief vans.'
  }
];
