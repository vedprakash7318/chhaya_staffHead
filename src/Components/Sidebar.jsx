import React, { useState } from 'react';
import './StyleCss/Sidebar.css';
import { FaChevronDown, FaChevronRight, FaUserAlt, FaPhoneVolume } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard } from 'react-icons/md';

export default function Sidebar({ isOpen }) {
  const [videoDropdownOpen, setVideoDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // to track current route

  const menu = [
    { icon: <MdDashboard />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FaPhoneVolume />, label: 'Calling Team', path: '/calling-team' },
    {
      icon: <FaUserAlt />, label: 'Leads', dropdown: [
        { label: 'Total Leads', icon: <FaUserAlt />, path: '/Leads/view-leads' },
        { label: 'Review Leads', icon: <FaUserAlt />, path: '/Leads/ReviewForm' },
      ]
    },
  ];

  const handleItemClick = (item) => {
    if (item.label === 'Leads') {
      setVideoDropdownOpen(!videoDropdownOpen);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  // Function to check active state
  const isActive = (path) => location.pathname === path;

  return (
    <div className={`admin-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <ul>
        {menu.map((item, i) => (
          <div key={i}>
            <li
              onClick={() => handleItemClick(item)}
              className={`sidebar-item ${item.path && isActive(item.path) ? 'active' : ''}`}
            >
              <span className="admin-icon">{item.icon}</span>
              <span className="admin-label">{item.label}</span>
              {item.dropdown && (
                <span className="dropdown-arrow">
                  {videoDropdownOpen ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              )}
            </li>

            {/* Dropdown submenu */}
            {item.label === 'Leads' && videoDropdownOpen && (
              <div className="dropdown-menu open">
                {item.dropdown.map((subItem, subIndex) => (
                  <li
                    key={subIndex}
                    className={`dropdown-item ${isActive(subItem.path) ? 'active' : ''}`}
                    onClick={() => navigate(subItem.path)}
                  >
                    <span className="admin-icon">{subItem.icon}</span>
                    <span className="admin-label">{subItem.label}</span>
                  </li>
                ))}
              </div>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
}
