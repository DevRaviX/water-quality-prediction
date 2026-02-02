import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Activity, Droplets, FlaskConical, FileText } from 'lucide-react';
import InputForm from './components/InputForm';
import StatsDashboard from './components/StatsDashboard';
import DataLab from './components/DataLab';
import ReportViewer from './components/ReportViewer';
import './App.css';

// SystemStatus Component
// ... (existing imports)

const TeamMember = ({ initials, name, role }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{
      width: '28px', height: '28px', borderRadius: '50%',
      background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid rgba(59, 130, 246, 0.3)'
    }}>
      {initials}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#e2e8f0' }}>{name}</span>
      <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>{role}</span>
    </div>
  </div>
);

const SystemStatus = () => {
  const [stats, setStats] = useState({ cpu: 15, mem: 40 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(Math.random() * 20) + 10, // 10-30%
        mem: Math.floor(Math.random() * 10) + 35  // 35-45%
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (

    <div style={{
      marginTop: '20px',
      paddingTop: '15px',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      fontSize: '0.8rem',
      color: 'var(--text-muted)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e',
          boxShadow: '0 0 8px #22c55e',
          animation: 'pulse 2s infinite'
        }}></div>
        <span style={{ fontWeight: '600', color: '#e2e8f0' }} title="Running on AWS ECS (Fargate). Region: ap-south-1">System Operational</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
        <span>CPU: {stats.cpu}%</span>
        <span>Mem: {stats.mem}MB</span>
      </div>
      <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '5px' }}>
        Region: us-east-1 (AWS)
      </div>
    </div>
  );
};

// Nav Component for reuse
const NavBase = ({ className, itemClass }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className={className}>
      <Link to="/" className={`${itemClass} ${isActive('/')}`}>
        <Home size={20} />
        <span>Predictor</span>
      </Link>
      <Link to="/analytics" className={`${itemClass} ${isActive('/analytics')}`}>
        <Activity size={20} />
        <span>Analytics</span>
      </Link>
      <Link to="/datalab" className={`${itemClass} ${isActive('/datalab')}`}>
        <FlaskConical size={20} />
        <span>Data Lab</span>
      </Link>
      <Link to="/report" className={`${itemClass} ${isActive('/report')}`}>
        <FileText size={20} />
        <span>Report</span>
      </Link>
    </nav>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header className="app-header">
        <div className="logo">
          <Droplets className="logo-icon" />
          <h1>Water Quality AI</h1>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="logo">
          <Droplets className="logo-icon" size={28} />
          <h1>Water Quality AI</h1>
        </div>

        <NavBase className="sidebar-nav" itemClass="sidebar-link" />

        <div style={{ padding: '20px', borderTop: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)' }}>
          <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', color: '#64748b', marginBottom: '15px' }}>Project Lead</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TeamMember initials="RG" name="Ravi Kant Gupta" role="Lead ML Engineer" />
          </div>

          <SystemStatus />
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <NavBase className="bottom-nav" itemClass="nav-item" />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<InputForm />} />
          <Route path="/analytics" element={<StatsDashboard />} />
          <Route path="/datalab" element={<DataLab />} />
          <Route path="/report" element={<ReportViewer />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
