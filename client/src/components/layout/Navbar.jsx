import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSun, FaMoon, FaSignOutAlt, FaUser, FaRobot } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <FaRobot className="logo-icon" />
          <span>AI Interview Bot</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link to="/interview" className="nav-link">
            Interview Room
          </Link>
          
          <div className="navbar-actions">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
            
            <div className="user-menu">
              <FaUser className="user-icon" />
              <span className="user-name">{user.name || 'User'}</span>
            </div>
            
            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;