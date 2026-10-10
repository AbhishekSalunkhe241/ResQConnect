import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Package, 
  Users, 
  Building2, 
  FileSpreadsheet, 
  Activity, 
  MapPin, 
  Truck, 
  ArrowUpRight 
} from 'lucide-react';
import { useRequests } from '../context/RequestContext';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';

export const Analytics = () => {
  const { requests, resources, usersList, auditLogs, stats } = useRequests();

  // Filters
  const [regionFilter, setRegionFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Filtered requests based on selections
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchRegion = regionFilter === 'All' || (req.location && req.location.includes(regionFilter));
      const matchCategory = categoryFilter === 'All' || req.category === categoryFilter;
      return matchRegion && matchCategory;
    });
  }, [requests, regionFilter, categoryFilter]);

  // Volunteers and NGOs
  const volunteers = useMemo(() => {
    return usersList.filter(u => u.role === 'volunteer');
  }, [usersList]);

  const ngos = useMemo(() => {
    return usersList.filter(u => u.role === 'ngo');
  }, [usersList]);

  // Dynamic Metrics
  const totalRequests = filteredRequests.length;
  const completedRequests = filteredRequests.filter(r => r.status === 'Completed').length;
  const activeRequests = filteredRequests.filter(r => !['Completed', 'Closed', 'Rejected'].includes(r.status)).length;
  const highPriorityCount = filteredRequests.filter(r => r.priority === 'High').length;
  const resolutionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;

  const totalInventoryUnits = useMemo(() => {
    return resources.reduce((acc, r) => acc + (r.quantity || 0), 0);
  }, [resources]);

  const lowStockItems = useMemo(() => {
    return resources.filter(r => r.status === 'Low Stock' || r.status === 'Critical');
  }, [resources]);

  // CSV Export Functionality (Requirement 8)
  const handleExportCSV = () => {
    if (filteredRequests.length === 0) {
      alert('No requests available to export for current filter.');
      return;
    }

    // CSV Headers
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
      'Special Accessibility',
      'Created At',
      'Assigned Volunteer',
      'Assigned NGO',
      'Completion Note'
    ];

    // Escape CSV string values
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = filteredRequests.map(r => [
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
      escapeCsv(r.createdAt || ''),
      escapeCsv(r.assignedVolunteer?.name || 'Unassigned'),
      escapeCsv(r.assignedOrganization?.name || 'None'),
      escapeCsv(r.completionNote || '')
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    // Create downloadable blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ResQConnect_Recovery_Data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="analytics-page" style={{ padding: '3rem 0 5rem', backgroundColor: 'var(--bg-app)' }}>
      <div className="container">
        {/* Header Section */}
        <div className="flex items-center justify-between md-flex-col md-items-start gap-4" style={{ marginBottom: '2.5rem' }}>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <Badge variant="teal" icon={<BarChart3 size={14} />}>
                Operations & Impact Reporting
              </Badge>
              <span className="text-xs text-muted">• Real-Time Shared Demo State</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Disaster Recovery Analytics
            </h1>
            <p className="text-muted" style={{ marginTop: '0.35rem', maxWidth: '680px', fontSize: '0.95rem' }}>
              Macro insights into citizen assistance demands, warehouse inventory turnover, field volunteer resolution rates, and NGO relief dispatches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="teal"
              icon={<Download size={16} />}
              onClick={handleExportCSV}
            >
              Export Live Data (CSV)
            </Button>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div 
          className="card"
          style={{
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div className="flex items-center gap-3 flex-wrap" style={{ flex: 1 }}>
            <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase">
              <Filter size={14} />
              <span>Filter Scope:</span>
            </div>

            <div style={{ minWidth: '180px' }}>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="form-select text-xs"
              >
                <option value="All">All Disaster Regions</option>
                <option value="Panvel">Panvel Urban & Rural</option>
                <option value="Karjat">Karjat Foothills</option>
                <option value="Alibag">Alibag Coastline</option>
                <option value="Pen">Pen Industrial Belt</option>
                <option value="Revdanda">Revdanda Jetty</option>
                <option value="Navi Mumbai">Navi Mumbai</option>
              </select>
            </div>

            <div style={{ minWidth: '180px' }}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-select text-xs"
              >
                <option value="All">All Assistance Categories</option>
                <option value="Food & Water">Food & Water</option>
                <option value="Medical Assistance">Medical Assistance</option>
                <option value="Shelter">Shelter</option>
                <option value="Transportation">Transportation</option>
                <option value="Household Supplies">Household Supplies</option>
              </select>
            </div>

            {(regionFilter !== 'All' || categoryFilter !== 'All') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRegionFilter('All');
                  setCategoryFilter('All');
                }}
              >
                Reset Scope
              </Button>
            )}
          </div>

          <span className="text-xs text-muted">
            Viewing <strong>{filteredRequests.length}</strong> matching assistance records
          </span>
        </div>

        {/* Top-Level KPI Cards */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <StatCard
            title="Total Logged Needs"
            value={totalRequests}
            subtext="Within selected scope"
            icon={<Layers size={22} />}
            colorScheme="blue"
          />
          <StatCard
            title="Active Operations"
            value={activeRequests}
            subtext={`${highPriorityCount} marked high priority`}
            icon={<Clock size={22} />}
            colorScheme="amber"
          />
          <StatCard
            title="Resolution Rate"
            value={`${resolutionRate}%`}
            subtext={`${completedRequests} completed tickets`}
            icon={<CheckCircle2 size={22} />}
            colorScheme="green"
          />
          <StatCard
            title="Tracked Relief Inventory"
            value={totalInventoryUnits}
            subtext={`${lowStockItems.length} items low stock`}
            icon={<Package size={22} />}
            colorScheme="purple"
          />
        </div>

        {/* Grid: Charts & Funnels */}
        <div className="grid-2" style={{ gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Request Status Distribution Funnel */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Assistance Ticket Lifecycle Funnel
                </h3>
                <span className="text-xs text-muted">Progress across verification, matching, and completion</span>
              </div>
              <Badge variant="teal">{totalRequests} Total</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Submitted (Intake)', key: 'Submitted', color: '#0284C7' },
                { label: 'Under Verification', key: 'Under Verification', color: '#D97706' },
                { label: 'Verified & Queued', key: 'Verified', color: '#0D9488' },
                { label: 'Matched to NGO', key: 'Matched', color: '#7E22CE' },
                { label: 'Assistance In Progress', key: 'Assistance In Progress', color: '#2563EB' },
                { label: 'Completed Deliveries', key: 'Completed', color: '#16A34A' }
              ].map((step, idx) => {
                const count = filteredRequests.filter(r => r.status === step.key).length;
                const percentage = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;

                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs font-semibold" style={{ marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{step.label}</span>
                      <span>{count} tickets ({percentage}%)</span>
                    </div>
                    <div style={{ height: '10px', backgroundColor: 'var(--bg-muted)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${percentage}%`, 
                          backgroundColor: step.color,
                          borderRadius: '5px',
                          transition: 'width 0.4s ease'
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assistance Category Distribution */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Need Distribution by Category
                </h3>
                <span className="text-xs text-muted">Proportion of physical supplies and services requested</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'Food & Water', color: '#0284C7', icon: 'Droplets' },
                { name: 'Shelter', color: '#7E22CE', icon: 'Home' },
                { name: 'Medical Assistance', color: '#DC2626', icon: 'HeartPulse' },
                { name: 'Household Supplies', color: '#0D9488', icon: 'Sparkles' },
                { name: 'Transportation', color: '#D97706', icon: 'Truck' }
              ].map((cat, idx) => {
                const count = filteredRequests.filter(r => r.category === cat.name).length;
                const pct = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;

                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs font-semibold" style={{ marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                      <span>{count} Requests ({pct}%)</span>
                    </div>
                    <div style={{ height: '10px', backgroundColor: 'var(--bg-muted)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${pct}%`, 
                          backgroundColor: cat.color,
                          borderRadius: '5px',
                          transition: 'width 0.4s ease'
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Priority breakdown mini pill row */}
            <div 
              style={{ 
                marginTop: '1.5rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem'
              }}
            >
              <span>Priority breakdown:</span>
              <div className="flex items-center gap-2">
                <span style={{ color: '#DC2626', fontWeight: 700 }}>● High: {filteredRequests.filter(r => r.priority === 'High').length}</span>
                <span style={{ color: '#D97706', fontWeight: 700 }}>● Med: {filteredRequests.filter(r => r.priority === 'Medium').length}</span>
                <span style={{ color: '#16A34A', fontWeight: 700 }}>● Low: {filteredRequests.filter(r => r.priority === 'Low').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Supply Chain & Warehouse Inventory Status */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Warehouse Supply Chain & Critical Stock Levels
              </h3>
              <p className="text-xs text-muted" style={{ margin: '0.2rem 0 0' }}>
                Inventory monitoring across depots in Panvel, Karjat, Alibag, and Pen. Low-stock warnings are highlighted automatically.
              </p>
            </div>
            <Badge variant={lowStockItems.length > 0 ? 'amber' : 'green'}>
              {lowStockItems.length > 0 ? `${lowStockItems.length} Low-Stock Alerts` : 'All Stocks Healthy'}
            </Badge>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Item Name</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Depot Location</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Stock Balance</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Safe Threshold</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge variant="teal">{item.category}</Badge>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                      {item.location}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>
                      <span style={{ color: item.quantity <= item.minThreshold ? 'var(--color-danger-main)' : 'var(--color-navy-900)' }}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {item.minThreshold} {item.unit}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge variant={item.status === 'In Stock' ? 'green' : item.status === 'Low Stock' ? 'amber' : 'red'}>
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Volunteer Mobilization & NGO Operational Summary */}
        <div className="grid-2" style={{ gap: '2rem' }}>
          {/* Volunteer Mobilization Roster Performance */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Volunteer Task Resolution Performance
                </h3>
                <span className="text-xs text-muted">Accredited responders deployed in active disaster zones</span>
              </div>
              <Badge variant="teal">{volunteers.length} Active</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {volunteers.map((vol) => (
                <div 
                  key={vol.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={vol.avatar} 
                      alt=""
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{vol.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {vol.location} • {vol.badge || 'Responder'}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, color: 'var(--color-teal-700)' }}>
                      {vol.completedTasksCount || 10} Done
                    </span>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: vol.status === 'Available' ? 'var(--color-success-text)' : 'var(--color-warning-text)' }}>
                      ● {vol.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NGO Operations Summary */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Partner NGO Operations Summary
                </h3>
                <span className="text-xs text-muted">Field organizations coordinating district dispatches</span>
              </div>
              <Badge variant="purple">{ngos.length} Partners</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {ngos.map((ngo) => (
                <div 
                  key={ngo.id}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{ngo.name}</strong>
                    <Badge variant={ngo.verified ? 'green' : 'amber'} style={{ fontSize: '0.7rem' }}>
                      {ngo.verified ? 'Accredited' : 'Pending Verification'}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted" style={{ margin: '0 0 0.5rem' }}>
                    {ngo.location} • Reg: {ngo.regNumber || 'Pending'}
                  </p>

                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>Active Missions: <strong>{ngo.activeMissions || 14}</strong></span>
                    <span>Completed Cases: <strong>{ngo.completedMissions || 182}</strong></span>
                    <span>Volunteers: <strong>{ngo.volunteersCount || 48}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
