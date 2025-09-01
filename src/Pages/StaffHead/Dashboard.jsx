// src/Pages/Dashboard/Dashboard.jsx
import React, { useState } from 'react';
import Sidebar from '../../Components/Sidebar';
import Navbar from '../../Components/header';
import '../CSS/Dashboard.css';

function Dashboard({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // collapsed by default

  return (
    <div className="admin-dashboard">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="main-section">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className={`content-wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
