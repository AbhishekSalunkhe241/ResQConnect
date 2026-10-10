import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartHandshake, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Building2, 
  Users, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState('citizen');
  const [email, setEmail] = useState('rahul.sharma@example.com');
  const [password, setPassword] = useState('demo12345');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Pre-configured demo accounts for quick one-click role switching
  const demoRoles = [
    {
      id: 'citizen',
      label: 'Citizen',
      tag: 'Active Portal',
      email: 'rahul.sharma@example.com',
      badgeVariant: 'teal',
      icon: <User size={18} />,
      desc: 'Submit requests, track recovery kits'
    },
    {
      id: 'volunteer',
      label: 'Volunteer',
      tag: 'Active Mobilization',
      email: 'priya.mehta@example.com',
      badgeVariant: 'amber',
      icon: <Users size={18} />,
      desc: 'Deliver aid, medical triage, logistics'
    },
    {
      id: 'ngo',
      label: 'Relief NGO',
      tag: 'Active Operations',
      email: 'contact@helpinghands.org',
      badgeVariant: 'purple',
      icon: <Building2 size={18} />,
      desc: 'Warehouse dispatch, mission logs'
    },
    {
      id: 'admin',
      label: 'Admin',
      tag: 'Active Console',
      email: 'admin@resqconnect.org',
      badgeVariant: 'slate',
      icon: <ShieldCheck size={18} />,
      desc: 'District desk, macro authority'
    }
  ];

  const handleRoleSelect = (roleObj) => {
    setSelectedRole(roleObj.id);
    setEmail(roleObj.email);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    login(selectedRole, email, password);

    // Route to appropriate destination
    switch (selectedRole) {
      case 'citizen':
        navigate('/citizen');
        break;
      case 'volunteer':
        navigate('/volunteer');
        break;
      case 'ngo':
        navigate('/ngo');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/citizen');
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
      <div style={{ maxWidth: '520px', width: '100%' }}>
        {/* Brand header */}
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
            Welcome to ResQConnect
          </h1>
          <p className="text-muted text-sm" style={{ marginTop: '0.35rem' }}>
            Access your post-disaster recovery and coordination dashboard
          </p>
        </div>

        {/* Demo Role Selector Section */}
        <Card style={{ marginBottom: '1.5rem', border: '1px solid #BAE6FD', backgroundColor: 'var(--color-primary-50)' }}>
          <div style={{ padding: '0.25rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Interactive Demo Role Switcher
                </span>
              </div>
              <Badge variant="blue">Select Role to Test</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoRoles.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    style={{
                      textAlign: 'left',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--bg-surface)' : 'rgba(255,255,255,0.6)',
                      border: isSelected ? '2px solid var(--color-primary-600)' : '1px solid #BAE6FD',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    <div className="flex items-center justify-between gap-1" style={{ marginBottom: '0.2rem' }}>
                      <div className="flex items-center gap-1.5" style={{ fontWeight: 700, color: isSelected ? 'var(--color-primary-700)' : 'var(--color-navy-800)', fontSize: '0.875rem' }}>
                        {r.icon}
                        <span>{r.label}</span>
                      </div>
                      <Badge variant={r.badgeVariant} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                        {r.tag}
                      </Badge>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>
                      {r.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Login Form Card */}
        <Card>
          <form onSubmit={handleLogin}>
            <Input
              label="Email Address"
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              icon={<Mail size={18} />}
            />

            <Input
              label="Password"
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              icon={<Lock size={18} />}
            />

            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--color-primary-600)' }}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary-600)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              block
              iconRight={<ArrowRight size={18} />}
              id="login-submit-btn"
            >
              Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
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
            <span>Don't have an account? </span>
            <Link to="/register" style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
              Create an account
            </Link>
          </div>
        </Card>

        {/* Informational Note */}
        <p className="text-center text-xs text-muted" style={{ marginTop: '1.5rem', lineHeight: 1.5 }}>
          🔒 ResQConnect Day 1 Prototype: Authentication is simulated via frontend state and mock session. Production JWT auth will connect on Day 2.
        </p>
      </div>

      {/* Forgot Password UI Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => {
          setShowForgotModal(false);
          setForgotSent(false);
        }}
        title="Reset Password"
        footer={
          forgotSent ? (
            <Button onClick={() => setShowForgotModal(false)} variant="primary">
              Close
            </Button>
          ) : (
            <>
              <Button onClick={() => setShowForgotModal(false)} variant="secondary">
                Cancel
              </Button>
              <Button
                onClick={() => setForgotSent(true)}
                variant="primary"
                disabled={!forgotEmail && !email}
              >
                Send Instructions
              </Button>
            </>
          )
        }
      >
        {forgotSent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Reset Link Dispatched
            </h4>
            <p className="text-sm text-muted">
              We have dispatched password recovery instructions to <strong>{forgotEmail || email}</strong>. (Frontend simulated flow)
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
              Enter your registered humanitarian account email to receive recovery instructions.
            </p>
            <Input
              label="Registered Email"
              type="email"
              value={forgotEmail || email}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="name@example.com"
              icon={<Mail size={18} />}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Login;
