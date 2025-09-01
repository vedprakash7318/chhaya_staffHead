import React, { useState } from 'react';
import './StyleCss/Sidebar.css';
import {
  FaHome, FaImage,FaUserTie,
  FaChevronDown, FaChevronRight, FaFilm, FaVideoSlash, FaYoutube
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ isOpen }) {
  const [videoDropdownOpen, setVideoDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const menu = [
    { icon: <FaHome />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FaImage />, label: 'Calling Team', path: '/calling-team' },
    {
      icon: <FaUserTie />, label: 'Leads', dropdown: [
        { label: 'Total Leads', icon: <FaFilm />, path: '/Leads/view-leads' },
        { label: 'Review Leads', icon: <FaYoutube />, path: '/Leads/ReviewForm' },
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

  return (
    <div
      className={`admin-sidebar ${isOpen ? 'open' : 'collapsed'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ul>
        {menu.map((item, i) => (
          <div key={i}>
            <li onClick={() => handleItemClick(item)} className="sidebar-item">
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
                    className="dropdown-item"
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
