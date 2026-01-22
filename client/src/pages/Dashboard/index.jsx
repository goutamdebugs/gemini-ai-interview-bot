import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRobot, FaPlay, FaChartLine, FaHistory, FaCog, FaArrowRight, FaUser, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({
    interviews: 0,
    averageScore: 0,
    totalTime: 0,
  });

  useEffect(() => {
    // Load user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);

    // Simulate loading user stats
    // In a real app, you would fetch this from your backend
    const userStats = JSON.parse(localStorage.getItem('userStats') || '{}');
    setStats({
      interviews: userStats.interviews || 0,
      averageScore: userStats.averageScore || 0,
      totalTime: userStats.totalTime || 0,
    });
  }, []);

  const features = [
    {
      id: 1,
      icon: <FaPlay />,
      title: 'Start Interview',
      description: 'Begin a new technical interview session with our AI interviewer. Practice React, JavaScript, algorithms, and system design.',
      link: '/interview',
      color: 'feature-1',
    },
    {
      id: 2,
      icon: <FaChartLine />,
      title: 'Performance Analytics',
      description: 'View detailed analytics of your past interviews. Track your progress and identify areas for improvement.',
      link: '/analytics',
      color: 'feature-2',
    },
    {
      id: 3,
      icon: <FaHistory />,
      title: 'Interview History',
      description: 'Review your previous interview sessions. Revisit questions and analyze your responses.',
      link: '/history',
      color: 'feature-3',
    },
    {
      id: 4,
      icon: <FaCog />,
      title: 'Customize Settings',
      description: 'Adjust interview difficulty, choose topics, and customize the AI interviewer behavior.',
      link: '/settings',
      color: 'feature-4',
    },
  ];

  const handleQuickStart = () => {
    navigate('/interview');
    toast.info('Starting a new interview session...');
  };

  const handleViewAnalytics = () => {
    toast.info('Analytics feature coming soon!');
  };

  const handleViewHistory = () => {
    toast.info('History feature coming soon!');
  };

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ToastContainer theme={document.documentElement.getAttribute('data-theme') || 'light'} />
      
      <div className="dashboard-header">
        <h1>AI Interview Dashboard</h1>
        <p>Master technical interviews with AI-powered practice sessions</p>
      </div>

      <div className="welcome-card">
        <div className="welcome-content">
          <h2>Welcome back, {user.name || 'Interviewer'}! 👋</h2>
          <p>
            Ready to ace your next technical interview? Our AI interviewer will help you practice 
            real-world coding problems, system design, and behavioral questions.
          </p>
          <div className="user-stats">
            <div className="stat-item stat-interview">
              <div className="stat-icon">
                <FaCalendarAlt />
              </div>
              <div className="stat-info">
                <h3>{stats.interviews}</h3>
                <p>Interviews Completed</p>
              </div>
            </div>
            <div className="stat-item stat-performance">
              <div className="stat-icon">
                <FaTrophy />
              </div>
              <div className="stat-info">
                <h3>{stats.averageScore}%</h3>
                <p>Average Score</p>
              </div>
            </div>
          </div>
        </div>
        <div className="welcome-illustration">
          <FaRobot size={120} style={{ color: 'var(--accent)', opacity: 0.8 }} />
        </div>
      </div>

      <div className="dashboard-content">
        {features.map((feature) => (
          <motion.div
            key={feature.id}
            className={`feature-card ${feature.color}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => feature.link.startsWith('/') ? navigate(feature.link) : toast.info('Feature coming soon!')}
          >
            <div className="feature-icon">
              {feature.icon}
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <Link to={feature.link} className="feature-link">
              Get Started <FaArrowRight />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-button primary" onClick={handleQuickStart}>
            <FaPlay /> Start Quick Interview
          </button>
          <button className="action-button secondary" onClick={handleViewAnalytics}>
            <FaChartLine /> View Analytics
          </button>
          <button className="action-button secondary" onClick={handleViewHistory}>
            <FaHistory /> View History
          </button>
        </div>
      </div>

      {/* Quick Tips Section */}
      <motion.div 
        className="feature-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ maxWidth: '1400px', margin: '2rem auto' }}
      >
        <h3>💡 Pro Tips for Success</h3>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          color: 'var(--text-secondary)',
          lineHeight: '1.8' 
        }}>
          <li>✅ Practice consistently - aim for at least 2-3 sessions per week</li>
          <li>✅ Focus on explaining your thought process clearly</li>
          <li>✅ Review your mistakes and learn from them</li>
          <li>✅ Use the speech features to practice verbal communication</li>
          <li>✅ Customize difficulty as you improve</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;