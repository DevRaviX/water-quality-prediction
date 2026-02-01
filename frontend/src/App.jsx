import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Activity, Droplets } from 'lucide-react';
import InputForm from './components/InputForm';
import StatsDashboard from './components/StatsDashboard';
import './App.css';

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
      <aside className="sidebar">
        <div className="logo">
          <Droplets className="logo-icon" size={28} />
          <h1>Water Quality AI</h1>
        </div>
        <NavBase className="sidebar-nav" itemClass="sidebar-link" />
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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
