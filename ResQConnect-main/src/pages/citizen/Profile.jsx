import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  Edit3, 
  X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';

export const Profile = () => {
  const { currentUser } = useAuth();
  const { requests } = useRequests();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || 'Rahul Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'rahul.sharma@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98201 44521');
  const [location, setLocation] = useState(currentUser?.location || 'Sector 12, Panvel, Maharashtra');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleCancel = () => {
    setName(currentUser?.name || 'Rahul Sharma');
    setEmail(currentUser?.email || 'rahul.sharma@example.com');
    setPhone(currentUser?.phone || '+91 98201 44521');
    setLocation(currentUser?.location || 'Sector 12, Panvel, Maharashtra');
    setIsEditing(false);
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            Citizen Profile
          </h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem' }}>
            Manage your personal recovery contact details and account verification.
          </p>
        </div>

        {!isEditing && (
          <Button
            variant="secondary"
            onClick={() => setIsEditing(true)}
            icon={<Edit3 size={16} />}
            id="edit-profile-btn"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {saved && (
        <div
          style={{
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            color: 'var(--color-success-text)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle2 size={18} />
          <span>Profile details updated successfully in frontend state.</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center gap-4 flex-wrap" style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'}
            alt=""
            style={{ 
              width: '72px', 
              height: '72px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: '3px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-xs)' 
            }}
          />

          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {name}
              </h2>
              <Badge variant="teal" icon={<ShieldCheck size={12} />}>
                Basic Account
              </Badge>
            </div>
            <p className="text-xs text-muted" style={{ marginTop: '0.35rem' }}>
              Joined ResQConnect: October 2026 • Raigad District Zone • {requests.length} Requests Filed
            </p>
          </div>
        </div>

        {/* SECTION 22: ACCOUNT INFORMATION */}
        <div style={{ paddingTop: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Account Information
          </h3>

          <div className="grid grid-cols-2 md-grid-cols-1 gap-3">
            <div 
              style={{ 
                backgroundColor: 'var(--bg-muted)', 
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-subtle)' 
              }}
            >
              <span className="text-xs font-semibold text-muted uppercase">Platform Role</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.15rem 0 0 0' }}>
                Citizen
              </p>
            </div>

            <div 
              style={{ 
                backgroundColor: 'var(--bg-muted)', 
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-subtle)' 
              }}
            >
              <span className="text-xs font-semibold text-muted uppercase">Verification Level</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-teal-700)', margin: '0.15rem 0 0 0' }}>
                Basic Account
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 22: PERSONAL INFORMATION */}
      <Card>
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Personal Information
          </h3>
          <span className="text-xs text-muted">Used for field dispatch & notifications</span>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '1rem' }}>
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                icon={<User size={18} />}
              />
            </div>

            <div className="grid grid-cols-2 md-grid-cols-1 gap-3" style={{ marginBottom: '1rem' }}>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail size={18} />}
              />

              <Input
                label="Phone (for field verification SMS & calls)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                icon={<Phone size={18} />}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <Input
                label="Location / Primary Neighborhood"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                helpText="Shared only with verified responders assigned to your assistance ticket."
                icon={<MapPin size={18} />}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <Button type="button" variant="secondary" onClick={handleCancel} icon={<X size={16} />}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<Save size={16} />} id="save-profile-btn">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 md-grid-cols-1 gap-4">
            <div>
              <span className="text-xs font-semibold text-muted uppercase">Full Name</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
                {name}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted uppercase">Email Address</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
                {email}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted uppercase">Phone</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
                {phone}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted uppercase">Location</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
                {location}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Profile;
