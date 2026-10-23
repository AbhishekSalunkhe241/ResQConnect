import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  HeartHandshake, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  Building2, 
  Users, 
  ArrowRight,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Badge from '../components/Badge';

export const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'citizen';

  const { register } = useAuth();

  const [role, setRole] = useState(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orgRegNo, setOrgRegNo] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    {
      id: 'citizen',
      label: 'Citizen / Family',
      icon: <User size={18} />,
      desc: 'Seeking post-disaster supplies, water, medication, or shelter aid'
    },
    {
      id: 'volunteer',
      label: 'Field Volunteer',
      icon: <Users size={18} />,
      desc: 'Contributing skills, aid delivery, first-aid, or logistics support'
    },
    {
      id: 'ngo',
      label: 'Relief NGO Desk',
      icon: <Building2 size={18} />,
      desc: 'Non-profit or medical body distributing verified supplies'
    }
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call backend register via AuthContext
      await register({
        name: fullName || 'New Registered Member',
        email,
        phone,
        role,
        location,
        password,
        regNumber: orgRegNo
      });

      // Navigate to appropriate dashboard
      if (role === 'citizen') {
        navigate('/citizen');
      } else if (role === 'volunteer') {
        navigate('/volunteer');
      } else {
        navigate('/ngo');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - var(--navbar-height))',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem'
      }}
      className="animate-fade-in"
    >
      <div style={{ maxWidth: '580px', width: '100%' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link
            to="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', marginBottom: '1rem' }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-navy-900)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-teal-500)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <HeartHandshake size={26} />
            </div>
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Join ResQConnect
          </h1>
          <p className="text-muted text-sm" style={{ marginTop: '0.35rem' }}>
            Register to request assistance or coordinate post-disaster community relief
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
            Select Your Role in Recovery:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => {
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  style={{
                    padding: '0.85rem 0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: active ? '2px solid var(--color-primary-600)' : '1px solid var(--border-default)',
                    backgroundColor: active ? 'var(--bg-surface)' : 'var(--bg-muted)',
                    color: active ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    textAlign: 'center',
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ color: active ? 'var(--color-primary-600)' : 'var(--text-muted)' }}>
                    {r.icon}
                  </div>
                  <span style={{ fontSize: '0.825rem' }}>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notice for NGO Registration */}
        {role === 'ngo' && (
          <div
            style={{
              backgroundColor: 'var(--color-info-bg)',
              border: '1px solid var(--color-info-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            <Info size={20} style={{ color: 'var(--color-info-main)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-info-text)', marginBottom: '0.2rem' }}>
                Organization Verification Notice
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-info-text)', lineHeight: 1.4 }}>
                For security and disaster integrity, non-profit accounts undergo review by local authorities or platform administrators. Full distribution authority will be enabled once 80G/12A documentation is confirmed.
              </p>
            </div>
          </div>
        )}

        {/* Registration Form Card */}
        <Card>
          <form onSubmit={handleRegister}>
            {error && (
              <div
                style={{
                  backgroundColor: 'var(--color-danger-bg)',
                  border: '1px solid var(--color-danger-border)',
                  color: 'var(--color-danger-text)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}
              >
                {error}
              </div>
            )}

            <Input
              label={role === 'ngo' ? 'Organization / Trust Name' : 'Full Name'}
              id="register-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={role === 'ngo' ? 'e.g. Maharashtra Relief Trust' : 'e.g. Rahul Sharma'}
              required
              icon={<User size={18} />}
            />

            <div className="grid grid-cols-2 md-grid-cols-1 gap-3">
              <Input
                label="Email Address"
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                icon={<Mail size={18} />}
              />

              <Input
                label="Phone Number"
                id="register-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98201 00000"
                required
                icon={<Phone size={18} />}
              />
            </div>

            <Input
              label="Location / Taluka / City"
              id="register-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Panvel, Maharashtra"
              required
              helpText="Used to map your profile to regional recovery zones."
              icon={<MapPin size={18} />}
            />

            {role === 'ngo' && (
              <Input
                label="NGO Registration / Darpan ID"
                id="register-regno"
                value={orgRegNo}
                onChange={(e) => setOrgRegNo(e.target.value)}
                placeholder="e.g. MAH-2022-NGO-8812"
                required
                icon={<Building2 size={18} />}
              />
            )}

            <div className="grid grid-cols-2 md-grid-cols-1 gap-3">
              <Input
                label="Password"
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                icon={<Lock size={18} />}
              />

              <Input
                label="Confirm Password"
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                icon={<Lock size={18} />}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              block
              disabled={isSubmitting}
              iconRight={<ArrowRight size={18} />}
              style={{ marginTop: '0.75rem' }}
              id="register-submit-btn"
            >
              {isSubmitting ? 'Creating Account...' : `Create ${role === 'citizen' ? 'Citizen' : role === 'volunteer' ? 'Volunteer' : 'NGO'} Account`}
            </Button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.875rem',
              color: 'var(--text-muted)'
            }}
          >
            <span>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </Card>

        {/* Privacy Note */}
        <p className="text-center text-xs text-muted" style={{ marginTop: '1.5rem', lineHeight: 1.5 }}>
          🛡️ ResQConnect adheres to strict humanitarian data privacy. Your contact coordinates are only shared with accredited field responders assigned to your verified recovery request.
        </p>
      </div>
    </div>
  );
};

export default Register;
