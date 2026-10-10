import React, { useState } from 'react';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Sparkles,
  LocateFixed,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { CATEGORIES_CONFIG } from '../../data/mockRequests';

export const RequestHelp = () => {
  const { currentUser } = useAuth();
  const { addRequest, draft, saveDraft, clearDraft } = useRequests();

  // Categories list
  const categoryOptions = [
    'Food & Water',
    'Medical Assistance',
    'Shelter',
    'Clothing',
    'Transportation',
    'Household Supplies',
    'Financial Assistance',
    'Other'
  ];

  // Priority options
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  // Form State
  const [category, setCategory] = useState(draft?.category || 'Food & Water');
  const [priority, setPriority] = useState(draft?.priority || 'Medium');
  const [title, setTitle] = useState(draft?.title || '');
  const [description, setDescription] = useState(draft?.description || '');
  
  // Location subfields
  const [address, setAddress] = useState(draft?.addressDetails?.address || '');
  const [city, setCity] = useState(draft?.addressDetails?.city || 'Panvel');
  const [state, setState] = useState(draft?.addressDetails?.state || 'Maharashtra');
  const [postalCode, setPostalCode] = useState(draft?.addressDetails?.postalCode || '410206');

  // Resource / Items Needed
  const [items, setItems] = useState(() => {
    if (draft?.itemsNeeded && draft.itemsNeeded.length > 0) {
      return draft.itemsNeeded;
    }
    // Default preset for initial category
    return [
      { item: 'Clean Drinking Water Cans (20L)', qty: 20, unit: 'cans' },
      { item: 'Dry Ration Food Kits', qty: 5, unit: 'kits' }
    ];
  });

  // Additional Information
  const [peopleAffected, setPeopleAffected] = useState(draft?.peopleAffected || '4');
  const [accessibility, setAccessibility] = useState(draft?.accessibility || 'None');
  const [additionalNotes, setAdditionalNotes] = useState(draft?.additionalNotes || '');

  // Validation & UI State
  const [errors, setErrors] = useState({});
  const [draftToast, setDraftToast] = useState(null);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  // Update resource presets when category changes (if user hasn't heavily customized or if requested)
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    // Find matching default presets
    const match = CATEGORIES_CONFIG.find(c => c.name === newCat);
    if (match && match.defaultItems) {
      setItems(match.defaultItems.map(i => ({ item: i.item, qty: i.defaultQty, unit: i.unit })));
    }
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: null }));
    }
  };

  // Add Item to list
  const handleAddItem = () => {
    setItems(prev => [...prev, { item: '', qty: 1, unit: 'units' }]);
  };

  // Remove Item
  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Update Item field
  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: null }));
    }
  };

  // Use Current Location (demo button)
  const handleUseCurrentLocation = () => {
    setAddress('Flat 302, Sagar Darshan Co-op, Sector 15');
    setCity('Panvel');
    setState('Maharashtra');
    setPostalCode('410206');
    setDraftToast('Demo location coordinates loaded successfully.');
    setTimeout(() => setDraftToast(null), 3000);
    // Clear location errors
    setErrors(prev => ({
      ...prev,
      address: null,
      city: null,
      state: null,
      postalCode: null
    }));
  };

  // Save Draft handler
  const handleSaveDraft = () => {
    const draftData = {
      category,
      priority,
      title,
      description,
      addressDetails: { address, city, state, postalCode },
      itemsNeeded: items,
      peopleAffected,
      accessibility,
      additionalNotes
    };
    saveDraft(draftData);
    setDraftToast('Draft saved successfully to local session.');
    setTimeout(() => setDraftToast(null), 3500);
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!category) newErrors.category = 'Please select a assistance category.';
    if (!description.trim()) {
      newErrors.description = 'Please describe the assistance you need.';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Please provide a more detailed description (minimum 15 characters).';
    }

    if (!address.trim()) newErrors.address = 'Street address or landmark is required.';
    if (!city.trim()) newErrors.city = 'City is required.';
    if (!state.trim()) newErrors.state = 'State is required.';
    if (!postalCode.trim()) newErrors.postalCode = 'Postal code is required.';

    if (!priority) newErrors.priority = 'Please choose a priority level.';

    // Validate resource items
    if (!items || items.length === 0) {
      newErrors.items = 'Please specify at least one required item or resource.';
    } else {
      const hasEmptyItem = items.some(i => !i.item.trim());
      const hasInvalidQty = items.some(i => !i.qty || Number(i.qty) <= 0);
      if (hasEmptyItem) {
        newErrors.items = 'Please enter an item or resource name for all rows.';
      } else if (hasInvalidQty) {
        newErrors.items = 'Quantity must be at least 1 for all items.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    const synthesizedTitle = title.trim() || `${category} recovery support for ${peopleAffected} people in ${city}`;

    const newReq = addRequest({
      category,
      priority,
      title: synthesizedTitle,
      description: description.trim(),
      addressDetails: {
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim()
      },
      location: `${address.trim()}, ${city.trim()}, ${state.trim()} ${postalCode.trim()}`,
      itemsNeeded: items.map(i => ({
        item: i.item.trim(),
        qty: Number(i.qty) || 1,
        unit: i.unit.trim() || 'units'
      })),
      peopleAffected: Number(peopleAffected) || 1,
      accessibility,
      additionalNotes: additionalNotes.trim()
    }, currentUser);

    clearDraft();
    setSubmittedRequest(newReq);
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }} className="animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
        <Button to="/citizen" variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
          Back to Citizen Dashboard
        </Button>

        {draft && !submittedRequest && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Draft saved in session</span>
            <button
              onClick={() => {
                clearDraft();
                setDraftToast('Draft cleared.');
                setTimeout(() => setDraftToast(null), 2500);
              }}
              className="text-xs text-primary font-semibold"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Clear Draft
            </button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {draftToast && (
        <div
          style={{
            backgroundColor: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-200)',
            color: 'var(--color-primary-700)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Sparkles size={16} />
          <span>{draftToast}</span>
        </div>
      )}

      {/* SUCCESS CONFIRMATION STATE (Section 11) */}
      {submittedRequest ? (
        <Card style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderTop: '4px solid var(--color-success-main)' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 0 6px rgba(22, 163, 74, 0.12)'
            }}
          >
            <CheckCircle2 size={42} />
          </div>

          <Badge variant="green" style={{ marginBottom: '0.75rem', fontSize: '0.85rem', padding: '0.25rem 0.75rem' }}>
            Request ID: #{submittedRequest.id}
          </Badge>

          <h1 style={{ fontSize: '1.95rem', fontWeight: 800, marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
            Request submitted successfully
          </h1>

          <p className="text-muted" style={{ maxWidth: '540px', margin: '0 auto 1.75rem', lineHeight: 1.6, fontSize: '1rem' }}>
            Your request has been submitted and is awaiting verification. A local field coordinator in <strong>{submittedRequest.addressDetails?.city || 'Panvel'}</strong> will review your details before matching with verified recovery partners.
          </p>

          <div 
            style={{ 
              maxWidth: '480px', 
              margin: '0 auto 2rem', 
              backgroundColor: 'var(--bg-muted)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1rem',
              textAlign: 'left',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.875rem'
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
              <span className="text-muted">Category:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{submittedRequest.category}</strong>
            </div>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
              <span className="text-muted">Initial Status:</span>
              <Badge variant="blue">Submitted</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Items Requested:</span>
              <span>{submittedRequest.itemsNeeded?.length || 0} relief items</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button
              to={`/citizen/requests/${submittedRequest.id}`}
              variant="primary"
              size="lg"
              id="view-submitted-request-btn"
            >
              View Request & Track Status
            </Button>
            <Button
              to="/citizen/requests"
              variant="secondary"
              size="lg"
            >
              Go to My Requests
            </Button>
          </div>
        </Card>
      ) : (
        /* MAIN FORM */
        <Card style={{ padding: '2rem 2.25rem' }}>
          {/* Header & Supporting Text (Section 4) */}
          <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
            <div className="flex items-center gap-2.5" style={{ marginBottom: '0.4rem' }}>
              <HeartHandshake size={28} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Request Help
              </h1>
            </div>
            <p className="text-muted" style={{ margin: 0, fontSize: '1rem', lineHeight: 1.5 }}>
              Tell us what assistance you need. Your request will be reviewed before matching with available support.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            
            {/* SECTION 5: REQUEST INFORMATION */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                What do you need help with?
              </h2>
              <p className="text-xs text-muted" style={{ marginBottom: '1.25rem' }}>
                Select the primary assistance category and indicate urgency level.
              </p>

              <div className="grid grid-cols-2 md-grid-cols-1 gap-4" style={{ marginBottom: '1.25rem' }}>
                {/* Category Dropdown */}
                <div className="form-group">
                  <label htmlFor="category-select" className="form-label">
                    Category <span style={{ color: 'var(--color-danger-main)' }}>*</span>
                  </label>
                  <select
                    id="category-select"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="form-select"
                    style={{ fontWeight: 600 }}
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <div className="form-error">{errors.category}</div>}
                </div>

                {/* Priority Selection */}
                <div className="form-group">
                  <label className="form-label">
                    Priority Level <span style={{ color: 'var(--color-danger-main)' }}>*</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: '0.2rem' }}>
                    {priorityOptions.map((p) => {
                      const isSelected = priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '2px solid var(--color-primary-600)' : '1px solid var(--border-default)',
                            backgroundColor: isSelected ? 'var(--color-primary-50)' : 'var(--bg-surface)',
                            color: isSelected ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: p === 'Critical' ? '#DC2626' : p === 'High' ? '#D97706' : p === 'Medium' ? '#0284C7' : '#64748B'
                            }}
                          />
                          <span>{p}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.priority && <div className="form-error">{errors.priority}</div>}
                </div>
              </div>

              {/* CRITICAL NOTICE (Section 5 requirement) */}
              {priority === 'Critical' && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    color: '#991B1B',
                    fontSize: '0.875rem',
                    lineHeight: 1.5
                  }}
                  role="alert"
                >
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                  <div>
                    <strong style={{ display: 'block', fontWeight: 700, marginBottom: '0.15rem' }}>
                      Notice for Critical Needs:
                    </strong>
                    <span>
                      For immediate life-threatening emergencies, contact local emergency services. ResQConnect focuses on post-disaster recovery coordination.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 6: DESCRIPTION */}
            <div style={{ marginBottom: '2.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.75rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Describe your need
                </h2>
                <span className="text-xs text-muted">
                  {description.length}/500 characters
                </span>
              </div>
              <p className="text-xs text-muted" style={{ marginBottom: '1rem' }}>
                Please share sufficient context so relief dispatch teams can prepare appropriate supplies.
              </p>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="request-title" className="form-label">
                  Summary Title <span className="text-muted text-xs font-normal">(Optional)</span>
                </label>
                <input
                  id="request-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Drinking water canisters for elderly residents in Sector 12"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <textarea
                  id="request-description"
                  rows={4}
                  maxLength={500}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors(prev => ({ ...prev, description: null }));
                  }}
                  placeholder="Briefly describe what assistance you need..."
                  className="form-textarea"
                  style={{ fontSize: '0.95rem', lineHeight: 1.6 }}
                />
                {errors.description && <div className="form-error">{errors.description}</div>}
                <div className="form-help">
                  Example: Family of four requires drinking water and basic food supplies following flooding in the area.
                </div>
              </div>
            </div>

            {/* SECTION 7: LOCATION */}
            <div style={{ marginBottom: '2.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.75rem' }}>
              <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Location
                  </h2>
                  <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                    Specify where assistance items should be delivered.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleUseCurrentLocation}
                  icon={<LocateFixed size={16} />}
                  id="use-current-location-btn"
                >
                  Use current location
                </Button>
              </div>

              <div className="grid grid-cols-2 md-grid-cols-1 gap-3" style={{ marginTop: '1rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2 md-span-1' }}>
                  <label htmlFor="address-field" className="form-label">
                    Address / Area <span style={{ color: 'var(--color-danger-main)' }}>*</span>
                  </label>
                  <input
                    id="address-field"
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                    }}
                    placeholder="e.g. Near Community Hall, Sector 12 or Street Landmark"
                    className="form-input"
                  />
                  {errors.address && <div className="form-error">{errors.address}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="city-field" className="form-label">
                    City <span style={{ color: 'var(--color-danger-main)' }}>*</span>
                  </label>
                  <input
                    id="city-field"
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) setErrors(prev => ({ ...prev, city: null }));
                    }}
                    placeholder="e.g. Panvel"
                    className="form-input"
                  />
                  {errors.city && <div className="form-error">{errors.city}</div>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="form-group">
                    <label htmlFor="state-field" className="form-label">
                      State <span style={{ color: 'var(--color-danger-main)' }}>*</span>
                    </label>
                    <input
                      id="state-field"
                      type="text"
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        if (errors.state) setErrors(prev => ({ ...prev, state: null }));
                      }}
                      placeholder="e.g. Maharashtra"
                      className="form-input"
                    />
                    {errors.state && <div className="form-error">{errors.state}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="postal-field" className="form-label">
                      Postal Code <span style={{ color: 'var(--color-danger-main)' }}>*</span>
                    </label>
                    <input
                      id="postal-field"
                      type="text"
                      value={postalCode}
                      onChange={(e) => {
                        setPostalCode(e.target.value);
                        if (errors.postalCode) setErrors(prev => ({ ...prev, postalCode: null }));
                      }}
                      placeholder="e.g. 410206"
                      className="form-input"
                    />
                    {errors.postalCode && <div className="form-error">{errors.postalCode}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 8: RESOURCE QUANTITY */}
            <div style={{ marginBottom: '2.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.75rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    What do you need?
                  </h2>
                  <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                    Itemized list of relief supplies needed for your household or group.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  icon={<Plus size={16} />}
                >
                  Add Another Item
                </Button>
              </div>

              {errors.items && (
                <div className="form-error" style={{ marginBottom: '0.75rem' }}>
                  {errors.items}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      backgroundColor: 'var(--bg-muted)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}
                    className="md-flex-col"
                  >
                    <div style={{ flex: 2, width: '100%' }}>
                      <label className="text-xs font-semibold text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>
                        Resource / Item Name *
                      </label>
                      <input
                        type="text"
                        value={it.item}
                        onChange={(e) => handleItemChange(idx, 'item', e.target.value)}
                        placeholder="e.g. Water bottles, Food kits, Blankets"
                        className="form-input text-sm"
                        style={{ backgroundColor: 'var(--bg-surface)' }}
                        required
                      />
                    </div>

                    <div style={{ width: '110px' }} className="md-w-full">
                      <label className="text-xs font-semibold text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={it.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        className="form-input text-sm"
                        style={{ backgroundColor: 'var(--bg-surface)' }}
                        required
                      />
                    </div>

                    <div style={{ width: '120px' }} className="md-w-full">
                      <label className="text-xs font-semibold text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>
                        Unit
                      </label>
                      <input
                        type="text"
                        value={it.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        placeholder="bottles, kits"
                        className="form-input text-sm"
                        style={{ backgroundColor: 'var(--bg-surface)' }}
                      />
                    </div>

                    <div style={{ alignSelf: 'flex-end', paddingBottom: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: items.length <= 1 ? 'var(--border-default)' : 'var(--color-danger-main)',
                          cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                          padding: '0.4rem',
                          borderRadius: 'var(--radius-sm)'
                        }}
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 9: ADDITIONAL INFORMATION */}
            <div style={{ marginBottom: '2.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Additional Information
              </h2>
              <p className="text-xs text-muted" style={{ marginBottom: '1.25rem' }}>
                Optional coordination details to assist the response logistics.
              </p>

              <div className="grid grid-cols-2 md-grid-cols-1 gap-4" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="people-affected" className="form-label">
                    Number of people affected
                  </label>
                  <input
                    id="people-affected"
                    type="number"
                    min="1"
                    max="500"
                    value={peopleAffected}
                    onChange={(e) => setPeopleAffected(e.target.value)}
                    placeholder="e.g. 4"
                    className="form-input"
                  />
                  <div className="form-help">Household members or individuals depending on this request</div>
                </div>

                <div className="form-group">
                  <label htmlFor="accessibility-req" className="form-label">
                    Accessibility requirements
                  </label>
                  <select
                    id="accessibility-req"
                    value={accessibility}
                    onChange={(e) => setAccessibility(e.target.value)}
                    className="form-select"
                  >
                    <option value="None">None</option>
                    <option value="Wheelchair / Mobility Assistance">Wheelchair / Mobility Assistance</option>
                    <option value="Infant / Nursing Mother Support">Infant / Nursing Mother Support</option>
                    <option value="Elderly Resident Care">Elderly Resident Care</option>
                    <option value="Chronic Condition / Cold Storage for Medicine">Chronic Condition / Cold Storage for Medicine</option>
                    <option value="Special Dietary / Vegetarian">Special Dietary / Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="additional-notes" className="form-label">
                  Additional Notes
                </label>
                <textarea
                  id="additional-notes"
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Ground floor flooded, access via rear stairwell..."
                  className="form-textarea"
                />
              </div>
            </div>

            {/* SUBMIT BUTTONS (Section 11) */}
            <div 
              className="flex items-center justify-between flex-wrap gap-3" 
              style={{ 
                borderTop: '2px solid var(--border-subtle)', 
                paddingTop: '1.5rem',
                marginTop: '1.5rem' 
              }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                icon={<Save size={18} />}
                id="save-draft-btn"
              >
                Save Draft
              </Button>

              <div className="flex items-center gap-3">
                <Button to="/citizen" variant="ghost">
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={<Send size={18} />}
                  id="submit-request-btn"
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default RequestHelp;
