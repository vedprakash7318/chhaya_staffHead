import React from "react";
import "./StyleCss/Sidebar.css";
import {
  FaUsers,
  FaPhoneAlt,
  FaUserCheck,
  FaUserEdit,
  FaBriefcase,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ All items listed separately
  const menu = [
    { icon: <MdDashboard />, label: "Dashboard", path: "/dashboard" },
    { icon: <FaPhoneAlt />, label: "Calling Team", path: "/calling-team" },
    { icon: <FaBriefcase />, label: "Jobs", path: "/job" },
    { icon: <FaUserEdit />, label: "Review Leads", path: "/ReviewForm" },
    { icon: <FaUserCheck />, label: "Total Leads", path: "/view-leads" },
    // { icon: <FaUsers />, label: "Clients", path: "/clients" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`admin-sidebar ${isOpen ? "open" : "collapsed"}`}>
      <ul>
        {menu.map((item, i) => (
          <li
            key={i}
            onClick={() => navigate(item.path)}
            className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
          >
            <span className="admin-icon">{item.icon}</span>
            <span className="admin-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
