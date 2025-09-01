import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaBell, FaEnvelope, FaUserCircle, FaBars } from 'react-icons/fa';
import './StyleCss/header.css';

const Header = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef();

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="admin-logo">
          <img src="public/logo.jpg" alt=""  style={{height:"30px", width:"100%"}}/>
        </div>
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <div className="search-bar">
          <span className='Heading'>Welcome Back Staff-Head !!</span>
        </div>
      </div>
      <div className="navbar-right">
        <div
          className="user-profile"
          ref={profileRef}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <FaUserCircle className="user-avatar" />
          <span className="username">Admin</span>
          {dropdownOpen && (
            <div className="profile-dropdown">
            <div className="dropdown-item">👤 Profile</div>
              <div className="dropdown-item">🚪 Logout</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
