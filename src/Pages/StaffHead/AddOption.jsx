import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/AddOption.css";

const API_URL = import.meta.env.VITE_API_URL;

const AddOptionPage = ({ formID, staffHeadID, onSuccessClose }) => {
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [jobs, setJobs] = useState([]);

  // ✅ Log received props
  useEffect(() => {
    console.log("🧾 Received Props:");
    console.log("formID ➜", formID);
    console.log("staffHeadID ➜", staffHeadID);
  }, [formID, staffHeadID]);

  // ✅ Fetch Jobs
  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs/${staffHeadID}`);
      console.log("✅ Job API Response:", res.data);

      // 🧩 Format jobs for dropdown
      const formattedJobs = res.data.data.map((j) => ({
        label: `${j.jobTitle} - ${j.country?.countryName || "Unknown"} | ${j.salary} AED`,
        value: j._id,
      }));

      setJobs(formattedJobs);
    } catch (err) {
      console.error("❌ Error fetching jobs:", err);
      toast.error("Failed to fetch jobs");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // ✅ Handle Save Option
  const handleSave = async () => {
    if (!job) {
      toast.error("Please select a Job option");
      return;
    }

    console.log("📤 Sending Data to Backend:");
    console.log({
      options: job,
      addedBy: staffHeadID,
      formId: formID,
    });

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/options-staff/add`, {
        options: job,
        addedBy: staffHeadID,
        formId: formID,
      });

      toast.success("Option added successfully!");
      setJob(null);

      // ✅ Auto-close modal after short delay
      setTimeout(() => {
        if (onSuccessClose) onSuccessClose();
      }, 1000);
    } catch (error) {
      console.error("❌ Error adding option:", error);
      toast.error(error.response?.data?.message || "Failed to add option");
    }
    setLoading(false);
  };

  return (
    <div className="opt-container">
      <div className="opt-form">
        <div className="opt-field">
          <label className="opt-label">Select Job Option</label>
          <Dropdown
            value={job}
            options={jobs}
            onChange={(e) => setJob(e.value)}
            placeholder="Select a Job"
            filter
            showClear
          />
        </div>

        <Button
          label={loading ? "Saving..." : "Add Option"}
          icon="pi pi-plus"
          loading={loading}
          onClick={handleSave}
          className="opt-button"
        />
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AddOptionPage;
