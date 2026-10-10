import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  PhoneCall, 
  Home, 
  Droplets, 
  HeartPulse, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  MapPin,
  Clock,
  Search, 
  Building2,
  Package,
  Users
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { recoveryPrinciples } from '../data/mockDisasters';
import { useRequests } from '../context/RequestContext';
import { mockRecoveryHubs } from '../data/mockHubs';

export const Recovery = () => {
  const { recoveryHubs = mockRecoveryHubs } = useRequests();

  // State for Hubs search & filter
  const [hubSearch, setHubSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [selectedHub, setSelectedHub] = useState(recoveryHubs[0] || null);

  // Filtered hubs
  const filteredHubs = useMemo(() => {
    return recoveryHubs.filter(hub => {
      const matchSearch = 
        hub.name.toLowerCase().includes(hubSearch.toLowerCase()) ||
        hub.zone.toLowerCase().includes(hubSearch.toLowerCase()) ||
        hub.address.toLowerCase().includes(hubSearch.toLowerCase());

      const matchStatus = statusFilter === 'All' || hub.status === statusFilter;
      const matchService = serviceFilter === 'All' || hub.services.some(s => s.toLowerCase().includes(serviceFilter.toLowerCase()));

      return matchSearch && matchStatus && matchService;
    });
  }, [recoveryHubs, hubSearch, statusFilter, serviceFilter]);

  return (
    <div className="recovery-page">
      {/* Header */}
      <section style={{ padding: '4.5rem 0 3rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <Badge variant="amber" icon={<AlertTriangle size={14} />} style={{ marginBottom: '1rem' }}>
            Mission Distinction & Recovery Centers
          </Badge>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-navy-950)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Recovery vs. Emergency Response
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            Understanding the critical separation between acute emergency extraction and the multi-week coordination of post-disaster humanitarian recovery.
          </p>
        </div>
      </section>

      {/* Direct Emergency Warning Box */}
      <section style={{ padding: '2.5rem 0', backgroundColor: '#FFFBEB', borderBottom: '1px solid #FCD34D' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid #F59E0B',
              padding: '2rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div className="flex items-start gap-4 md-flex-col">
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF3C7',
                  color: 'var(--color-warning-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <PhoneCall size={28} />
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#92400E', marginBottom: '0.4rem' }}>
                  If You Are In Acute Danger: Dial 112 Immediately
                </h3>
                <p style={{ color: '#78350F', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                  ResQConnect does <strong>NOT replace 112, fire rescue, or National Disaster Response Force (NDRF)</strong> teams. If water is rising rapidly, a building structure is unstable, or there is an urgent medical trauma, contact emergency civil services right now.
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  <div style={{ padding: '0.5rem 1rem', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-sm)', fontWeight: 700, color: '#92400E', fontSize: '0.9rem' }}>
                    National Emergency: 112
                  </div>
                  <div style={{ padding: '0.5rem 1rem', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-sm)', fontWeight: 700, color: '#92400E', fontSize: '0.9rem' }}>
                    NDRF Helpline: 011-24363260
                  </div>
                  <div style={{ padding: '0.5rem 1rem', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-sm)', fontWeight: 700, color: '#92400E', fontSize: '0.9rem' }}>
                    State Relief Desk: 1070
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 7: RECOVERY HUBS & SCHEMATIC MAP DIRECTORY      */}
      {/* ======================================================== */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem' }}>
            <Badge variant="teal" icon={<Building2 size={14} />} style={{ marginBottom: '0.75rem' }}>
              Field Assistance Centers Network
            </Badge>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-navy-950)', marginBottom: '0.75rem' }}>
              Active Post-Disaster Recovery Hubs
            </h2>
            <p className="text-muted" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
              Locate designated community supply centers, drinking water refilling points, outpatient pop-up dispensaries, and verified volunteer desks across the Raigad & Konkan recovery corridor.
            </p>
            <p className="text-xs text-muted" style={{ fontStyle: 'italic', marginTop: '0.35rem' }}>
              * Fictional demo network established for academic mini-project simulation.
            </p>
          </div>

          {/* Search and Filter Row */}
          <div 
            className="card" 
            style={{ 
              padding: '1.25rem', 
              marginBottom: '2rem',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <div style={{ flex: '1 1 260px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search hub by name, town, or address..."
                  value={hubSearch}
                  onChange={(e) => setHubSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>

              <div style={{ flex: '0 1 180px' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="All">All Operating Statuses</option>
                  <option value="Operational">Operational</option>
                  <option value="High Demand">High Demand</option>
                  <option value="Restocking">Restocking</option>
                </select>
              </div>

              <div style={{ flex: '0 1 200px' }}>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="All">All Services</option>
                  <option value="Drinking Water">Drinking Water</option>
                  <option value="Dry Ration">Dry Food Rations</option>
                  <option value="First-Aid">First-Aid & Medical</option>
                  <option value="Tarpaulin">Tarpaulins & Shelter</option>
                  <option value="Solar">Solar Power & Charging</option>
                </select>
              </div>

              {(hubSearch || statusFilter !== 'All' || serviceFilter !== 'All') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setHubSearch('');
                    setStatusFilter('All');
                    setServiceFilter('All');
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Grid Layout: Schematic Interactive Map + Hub Details */}
          <div className="grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
            {/* Left: Schematic Map & Hub Cards List */}
            <div>
              {/* Responsive SVG Schematic Map */}
              <div 
                className="card"
                style={{
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} style={{ color: 'var(--color-teal-500)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                      Schematic Sector Map — Raigad Recovery Basin
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: '#94A3B8' }}>Click pin to inspect hub</span>
                </div>

                {/* SVG Schematic Canvas */}
                <div 
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '280px',
                    backgroundColor: '#1E293B',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Subtle Grid Lines */}
                  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.25 }}>
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748B" strokeWidth="0.75"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    {/* Simulated river / coastline line */}
                    <path 
                      d="M 10 270 Q 120 200 180 150 T 260 80 T 360 40" 
                      fill="none" 
                      stroke="#0284C7" 
                      strokeWidth="3" 
                      strokeDasharray="4 4"
                      opacity="0.6"
                    />
                    <path 
                      d="M 150 280 Q 220 230 280 200 T 420 180" 
                      fill="none" 
                      stroke="#0D9488" 
                      strokeWidth="2" 
                      opacity="0.4"
                    />
                  </svg>

                  {/* Labeled Territory Watermarks */}
                  <div style={{ position: 'absolute', top: '15px', left: '20px', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Thane Creek & Navi Mumbai
                  </div>
                  <div style={{ position: 'absolute', bottom: '15px', right: '20px', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Western Ghats Foothills (Karjat)
                  </div>
                  <div style={{ position: 'absolute', bottom: '15px', left: '20px', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Coastal Arabian Sea (Alibag)
                  </div>

                  {/* Dynamic Interactive Hub Pins */}
                  {recoveryHubs.map((hub) => {
                    const isSelected = selectedHub?.id === hub.id;
                    const statusBg = hub.status === 'Operational' ? '#10B981' : hub.status === 'High Demand' ? '#F59E0B' : '#0284C7';

                    return (
                      <button
                        key={hub.id}
                        onClick={() => setSelectedHub(hub)}
                        title={`${hub.name} (${hub.status})`}
                        style={{
                          position: 'absolute',
                          left: `${hub.mapCoords?.x || 50}%`,
                          top: `${hub.mapCoords?.y || 50}%`,
                          transform: 'translate(-50%, -50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          zIndex: isSelected ? 10 : 2,
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        {/* Pin Bubble */}
                        <div
                          style={{
                            width: isSelected ? '34px' : '26px',
                            height: isSelected ? '34px' : '26px',
                            borderRadius: '50%',
                            backgroundColor: statusBg,
                            border: isSelected ? '3px solid #FFFFFF' : '2px solid rgba(255,255,255,0.7)',
                            boxShadow: isSelected ? '0 0 15px rgba(20, 184, 166, 0.8)' : '0 2px 5px rgba(0,0,0,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '0.75rem'
                          }}
                        >
                          <Building2 size={isSelected ? 16 : 13} />
                        </div>

                        {/* Label Pill */}
                        <span
                          style={{
                            marginTop: '4px',
                            backgroundColor: isSelected ? 'var(--color-teal-600)' : 'rgba(15, 23, 42, 0.85)',
                            color: '#FFFFFF',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            whiteSpace: 'nowrap',
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}
                        >
                          {hub.zone}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hub Cards Directory */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.35rem' }}>
                {filteredHubs.map((hub) => {
                  const isSelected = selectedHub?.id === hub.id;
                  return (
                    <div
                      key={hub.id}
                      onClick={() => setSelectedHub(hub)}
                      className={`card ${isSelected ? 'card-selected' : 'card-hover'}`}
                      style={{
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        borderColor: isSelected ? 'var(--color-teal-600)' : 'var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--color-teal-50)' : '#FFFFFF',
                        borderLeft: `4px solid ${hub.status === 'Operational' ? 'var(--color-success-main)' : hub.status === 'High Demand' ? 'var(--color-warning-main)' : 'var(--color-info-main)'}`
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-navy-950)' }}>
                          {hub.name}
                        </span>
                        <Badge variant={hub.status === 'Operational' ? 'green' : hub.status === 'High Demand' ? 'amber' : 'blue'}>
                          {hub.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted" style={{ marginBottom: '0.5rem' }}>
                        <MapPin size={13} style={{ color: 'var(--color-teal-600)', flexShrink: 0 }} />
                        <span>{hub.address}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-secondary">
                        <span>Capacity: <strong>{hub.capacity}</strong></span>
                        <span style={{ color: 'var(--color-teal-700)', fontWeight: 600 }}>Click to inspect →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Hub Detailed Panel */}
            <div>
              {selectedHub ? (
                <div 
                  className="card"
                  style={{
                    padding: '2rem',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-md)',
                    backgroundColor: '#FFFFFF',
                    position: 'sticky',
                    top: '90px'
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                    <Badge variant="teal">{selectedHub.district}</Badge>
                    <Badge variant={selectedHub.status === 'Operational' ? 'green' : selectedHub.status === 'High Demand' ? 'amber' : 'blue'}>
                      ● {selectedHub.status}
                    </Badge>
                  </div>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy-950)', marginBottom: '0.35rem' }}>
                    {selectedHub.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-muted" style={{ marginBottom: '1.25rem' }}>
                    <MapPin size={14} style={{ color: 'var(--color-teal-600)', flexShrink: 0 }} />
                    <span>{selectedHub.address}</span>
                  </div>

                  {/* Key Stats Bar */}
                  <div 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                      backgroundColor: 'var(--bg-app)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-1 text-muted text-xs font-semibold">
                        <Clock size={13} />
                        <span>OPERATING HOURS</span>
                      </div>
                      <p style={{ fontWeight: 700, margin: '0.2rem 0 0', color: 'var(--color-navy-900)' }}>
                        {selectedHub.operatingHours}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-muted text-xs font-semibold">
                        <Users size={13} />
                        <span>CAPACITY LOAD</span>
                      </div>
                      <p style={{ fontWeight: 700, margin: '0.2rem 0 0', color: 'var(--color-navy-900)' }}>
                        {selectedHub.capacity} ({selectedHub.occupancyRate}% full)
                      </p>
                    </div>
                  </div>

                  {/* Available Services Checklist */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                      On-Site Humanitarian Services
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {selectedHub.services.map((svc, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <div 
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-teal-50)',
                              color: 'var(--color-teal-700)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              flexShrink: 0
                            }}
                          >
                            ✓
                          </div>
                          <span>{svc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inventory Snapshot */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Depot Inventory Highlights
                    </h4>
                    <div 
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--color-navy-900)'
                      }}
                    >
                      {selectedHub.inventorySummary}
                    </div>
                  </div>

                  {/* On-Site Coordinator / Contact info */}
                  <div 
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-muted)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.825rem'
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                      <span className="text-muted font-bold">Field Coordinator:</span>
                      <strong style={{ color: 'var(--color-navy-900)' }}>{selectedHub.contactPerson}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted font-bold">Demo Support Desk:</span>
                      <span style={{ color: 'var(--color-teal-700)', fontWeight: 700 }}>{selectedHub.phone}</span>
                    </div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.4rem', fontStyle: 'italic' }}>
                      * Note: Telephone numbers are fictional college project mock data.
                    </span>
                  </div>

                  {/* Non-emergency notice */}
                  <div 
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FCD34D',
                      fontSize: '0.775rem',
                      color: '#92400E',
                      lineHeight: 1.4
                    }}
                  >
                    <strong>Recovery Facility Notice:</strong> This hub is designated for planned multi-week rehabilitation supplies and displacement lodging. For active life threats, water rescue, or fire emergencies, dial 112 immediately.
                  </div>
                </div>
              ) : (
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                  <p className="text-muted">Select any recovery center on the map to inspect its services and availability.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Grid: Recovery vs Emergency Response */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-app)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy-950)' }}>
              Where Does ResQConnect Fit In?
            </h2>
            <p className="text-muted" style={{ marginTop: '0.35rem' }}>
              Disaster management has distinct phases. We bridge the critical gap from Day 2 through recovery stabilization.
            </p>
          </div>

          <div className="grid-2" style={{ gap: '2rem' }}>
            {/* Acute Emergency Column */}
            <Card style={{ borderTop: '4px solid #DC2626' }}>
              <div style={{ padding: '0.5rem 0 1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
                <span className="badge badge-red" style={{ marginBottom: '0.5rem' }}>Hours 0 – 48</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-navy-950)' }}>
                  Acute Emergency Response
                </h3>
                <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>
                  Managed exclusively by civil defense authorities & NDRF
                </p>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#DC2626', fontWeight: 'bold' }}>✕</span>
                  <span>Flood boat extractions from rooftops & inundated currents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#DC2626', fontWeight: 'bold' }}>✕</span>
                  <span>Structural building collapses and active rubble search</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#DC2626', fontWeight: 'bold' }}>✕</span>
                  <span>Severe acute medical trauma and ICU airlifting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#DC2626', fontWeight: 'bold' }}>✕</span>
                  <span>Live downed high-voltage power lines & gas main ruptures</span>
                </li>
              </ul>
            </Card>

            {/* ResQConnect Post-Disaster Column */}
            <Card style={{ borderTop: '4px solid var(--color-teal-600)' }}>
              <div style={{ padding: '0.5rem 0 1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
                <span className="badge badge-teal" style={{ marginBottom: '0.5rem' }}>Day 2 – Day 180+</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-navy-950)' }}>
                  Post-Disaster Recovery & Care
                </h3>
                <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>
                  Coordinated directly through ResQConnect platform
                </p>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--color-teal-600)', fontWeight: 'bold' }}>✓</span>
                  <span>Clean drinking water canisters & water purification tablets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--color-teal-600)', fontWeight: 'bold' }}>✓</span>
                  <span>Chronic prescription refills for displaced elderly & infants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--color-teal-600)', fontWeight: 'bold' }}>✓</span>
                  <span>Waterproof tarpaulins, dry bedding, and temporary shelter kits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--color-teal-600)', fontWeight: 'bold' }}>✓</span>
                  <span>Sanitation lime, bleaching powder, and mud clearing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--color-teal-600)', fontWeight: 'bold' }}>✓</span>
                  <span>Eliminating duplicate relief distribution across adjoining lanes</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Recovery Principles */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Badge variant="teal" style={{ marginBottom: '0.5rem' }}>
              Guiding Philosophy
            </Badge>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy-950)' }}>
              Core Recovery Principles
            </h2>
          </div>

          <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
            {recoveryPrinciples.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                  <ShieldCheck size={20} style={{ color: 'var(--color-teal-600)' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                    {item.title}
                  </h3>
                </div>
                <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Button to="/citizen" variant="primary" size="lg" iconRight={<ArrowRight size={18} />}>
              Open Citizen Recovery Shell
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Recovery;
