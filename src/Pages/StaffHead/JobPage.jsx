import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/JobPage.css";

const JobPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [jobs, setJobs] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    description: "",
    WorkTime: "",
    salary: "",
    serviceCharge: "",
    // adminCharge: "",
    country: "",
    jobAddedBy: "",
    jobAddedByType: "",
    lastDateToApply: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  const JOB_API = `${API_URL}/api/jobs`;
  const COUNTRY_API = `${API_URL}/api/countries`;
  const staffHeadID = localStorage.getItem("staffHeadID");

  useEffect(() => {
    if (!localStorage.getItem('staffHeadID')) {
      navigate('/')
    }
  })
  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${JOB_API}/${staffHeadID}`);
      // console.log(res);

      setJobs(res.data.data);
    } catch (err) {
      toast.error("Error fetching jobs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch countries
  const fetchCountries = async () => {
    try {
      const res = await axios.get(COUNTRY_API);
      setCountries(res.data.data.map(c => ({ label: c.countryName, value: c._id })));
    } catch (err) {
      toast.error("Error fetching countries");
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCountries();
  }, []);

  // Input change handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleNumericChange = (e, field) => {
    setFormData({ ...formData, [field]: e.value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: "" });
    }
  };

  const handleDropdown = (e) => {
    setFormData({ ...formData, country: e.value });
    if (formErrors.country) {
      setFormErrors({ ...formErrors, country: "" });
    }
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, lastDateToApply: e.value });
    if (formErrors.lastDateToApply) {
      setFormErrors({ ...formErrors, lastDateToApply: "" });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.jobTitle.trim()) errors.jobTitle = "Job title is required";
    if (!formData.country) errors.country = "Country is required";
    if (!formData.serviceCharge && formData.serviceCharge !== 0) errors.serviceCharge = "Service charge is required";
    // if (!formData.adminCharge && formData.adminCharge !== 0) errors.adminCharge = "Admin charge is required";
    if (formData.serviceCharge < 0) errors.serviceCharge = "Service charge cannot be negative";
    // if (formData.adminCharge < 0) errors.adminCharge = "Admin charge cannot be negative";
    if (!formData.lastDateToApply) errors.lastDateToApply = "Last date to apply is required";
    if (formData.lastDateToApply && new Date(formData.lastDateToApply) < new Date()) {
      errors.lastDateToApply = "Last date to apply cannot be in the past";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Add modal
  const openAddDialog = () => {
    setFormData({
      jobTitle: "",
      description: "",
      WorkTime: "",
      salary: "",
      serviceCharge: "",
      // adminCharge: "",
      country: "",
      jobAddedBy: staffHeadID,
      jobAddedByType: "StaffHead",
      lastDateToApply: null
    });
    setFormErrors({});
    setIsEdit(false);
    setDialogVisible(true);
  };

  // Open Edit modal
  const openEditDialog = (row) => {
    setFormData({
      jobTitle: row.jobTitle,
      description: row.description || "",
      WorkTime: row.WorkTime || "",
      salary: row.salary || "",
      serviceCharge: row.serviceCharge,
      // adminCharge: row.adminCharge,
      country: row.country?._id,
      lastDateToApply: row.lastDateToApply ? new Date(row.lastDateToApply) : null
    });
    setFormErrors({});
    setSelectedId(row._id);
    setIsEdit(true);
    setDialogVisible(true);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const submitData = {
        ...formData,
        WorkTime: formData.WorkTime.trim(),
        lastDateToApply: formData.lastDateToApply.toISOString()
      };

      if (isEdit) {
        await axios.put(`${JOB_API}/${selectedId}`, submitData);
        toast.success("Job updated successfully");
      } else {
        await axios.post(JOB_API, submitData);
        toast.success("Job added successfully");
      }
      setDialogVisible(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving job");
    }
  };

  // Delete job
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`${JOB_API}/${id}`);
        toast.success("Job deleted successfully");
        fetchJobs();
      } catch (err) {
        toast.error("Error deleting job");
      }
    }
  };

  // Format number without currency symbol
  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00';
    }
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if job is expired
  const isJobExpired = (lastDateToApply) => {
    if (!lastDateToApply) return false;
    return new Date(lastDateToApply) < new Date();
  };

  // Template functions for columns
  const salaryTemplate = (row) => (
    <span className="JobPage-salary-value">
      {row.salary && row.salary !== 0 ? formatNumber(row.salary) : '-'}
    </span>
  );

  const serviceChargeTemplate = (row) => (
    <span className="JobPage-service-charge-value">
      {formatNumber(row.serviceCharge)}
    </span>
  );

  // const adminChargeTemplate = (row) => (
  //   <span className="JobPage-admin-charge-value">
  //     {formatNumber(row.adminCharge)}
  //   </span>
  // );

  const workTimeTemplate = (row) => (
    <span className="JobPage-work-time-badge">
      {row.WorkTime || 'Not specified'}
    </span>
  );

  const countryTemplate = (row) => (
    <div className="JobPage-country-cell">
      <i className="pi pi-globe JobPage-country-icon"></i>
      <span>{row.country?.countryName || '-'}</span>
    </div>
  );

  const jobTitleTemplate = (row) => (
    <div className="JobPage-job-title-cell">
      <i className="pi pi-briefcase JobPage-job-icon"></i>
      <span className="JobPage-job-title">{row.jobTitle}</span>
    </div>
  );

  const descriptionTemplate = (row) => (
    <div className="JobPage-description-cell" title={row.description}>
      {row.description || 'No description'}
    </div>
  );

  const createdDateTemplate = (row) => (
    <span className="JobPage-date-cell">
      {new Date(row.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}
    </span>
  );

  const lastDateTemplate = (row) => (
    <span className={`JobPage-last-date-value ${isJobExpired(row.lastDateToApply) ? 'JobPage-expired' : ''}`}>
      {formatDate(row.lastDateToApply)}
      {isJobExpired(row.lastDateToApply)}
    </span>
  );
  const statusTemplate = (row) => (
    <span className={`JobPage-status-badge ${row.isActive ? 'JobPage-status-active' : 'JobPage-status-expired'}`}>
      {row.isActive ? 'Active' : 'Expired'}
    </span>
  );

  const actionTemplate = (row) => (
    <div className="JobPage-action-buttons">
      <Button
        icon="pi pi-pencil"
        className="JobPage-edit-btn p-button-rounded"
        onClick={() => openEditDialog(row)}
        tooltip="Edit Job"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-trash"
        className="JobPage-delete-btn p-button-rounded"
        onClick={() => handleDelete(row._id)}
        tooltip="Delete Job"
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  );

  return (
    <div className="JobPage-container">
      <ToastContainer position="top-right" className="JobPage-toast-container" />

      {/* Header Section */}
      <div className="JobPage-header-section">
        <div className="JobPage-header-content">
          <div className="JobPage-title-section">
            <h1 className="JobPage-page-title">Job Management</h1>
          </div>
          <div className="JobPage-search-container">
            <span className="JobPage-search-wrapper   ">

              <InputText
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search jobs..."
                className="JobPage-search-input"
              />
            </span>
          </div>
          <Button
            label="Add New Job"
            icon="pi pi-plus"
            className="JobPage-add-btn"
            onClick={openAddDialog}
          />
        </div>
      </div>

      {/* Data Table Section */}
      <DataTable
        value={jobs}
        paginator
        rows={10}
        loading={loading}
        globalFilter={globalFilter}
        emptyMessage="No jobs found"
        className="JobPage-datatable"
        responsiveLayout="scroll"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} jobs"
      >
        <Column
          field="jobTitle"
          header="Job Title"
          body={jobTitleTemplate}
          filter
          filterPlaceholder="Search by title"
          className="JobPage-job-title-column"
          headerClassName="JobPage-header-cell"
          style={{ minWidth: '220px' }}
        />
        <Column
          field="description"
          header="Description"
          body={descriptionTemplate}
          className="JobPage-description-column"
          headerClassName="JobPage-header-cell"
          style={{ minWidth: '250px' }}
        />
        <Column
          field="WorkTime"
          header="Work Time"
          body={workTimeTemplate}
          className="JobPage-work-time-column"
          headerClassName="JobPage-header-cell"
          style={{ minWidth: '150px' }}
        />
        <Column
          field="salary"
          header="Salary"
          body={salaryTemplate}
          className="JobPage-salary-column"
          headerClassName="JobPage-header-cell"
          style={{ minWidth: '120px' }}
        />
        <Column
          field="serviceCharge"
          header="Service Charge"
          body={serviceChargeTemplate}
          className="JobPage-service-charge-column"
          headerClassName="JobPage-header-cell"
          style={{ minWidth: '140px' }}
        />
        {/* <Column 
            field="adminCharge" 
            header="Admin Charge" 
            body={adminChargeTemplate} 
            className="JobPage-admin-charge-column"
            headerClassName="JobPage-header-cell"
            style={{ minWidth: '140px' }}
          /> */}
        <Column
          field="country.countryName"
          header="Country"
          body={countryTemplate}
          filter
          filterPlaceholder="Search by country"
          className="JobPage-country-column"
          headerClassName="JobPage-header-cell"
          style={{ minWidth: '120px' }}
        />
        <Column
          field="lastDateToApply"
          header="Last Date to Apply"
          body={lastDateTemplate}
          className="JobPage-last-date-column"
          headerClassName="JobPage-header-cell"
          style={{ minWidth: '150px' }}
        />
        <Column
          field="createdAt"
          header="Created Date"
          body={createdDateTemplate}
          className="JobPage-date-column"
          headerClassName="JobPage-header-cell"
          style={{ minWidth: '120px' }}
        />
        <Column
          body={statusTemplate}
          header="Status"
          className="JobPage-status-column"
          headerClassName="JobPage-header-cell"
          style={{ minWidth: '100px' }}
        />
        <Column
          body={actionTemplate}
          header="Actions"
          className="JobPage-actions-column"
          headerClassName="JobPage-header-cell"
          style={{ width: '120px' }}
        />
      </DataTable>


      {/* Modal Dialog */}
      <Dialog
        header={
          <div className="JobPage-dialog-header">
            <i className={`pi ${isEdit ? 'pi-pencil' : 'pi-plus'} JobPage-dialog-icon`}></i>
            <span>{isEdit ? "Edit Job" : "Add New Job"}</span>
          </div>
        }
        visible={dialogVisible}
        className="JobPage-dialog"
        onHide={() => setDialogVisible(false)}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        style={{ width: '650px' }}
      >
        <div className="JobPage-form-container p-fluid">
          {/* Job Title */}
          <div className="JobPage-form-field">
            <label htmlFor="jobTitle" className="JobPage-form-label">
              Job Title <span className="JobPage-required">*</span>
            </label>
            <InputText
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              className={`JobPage-form-input ${formErrors.jobTitle ? 'JobPage-form-input-error' : ''}`}
              placeholder="Enter job title"
            />
            {formErrors.jobTitle && <small className="JobPage-error-message">{formErrors.jobTitle}</small>}
          </div>

          {/* Description */}
          <div className="JobPage-form-field">
            <label htmlFor="description" className="JobPage-form-label">
              Description
            </label>
            <InputText
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="JobPage-form-input"
              placeholder="Enter job description"
            />
          </div>

          {/* Work Time */}
          <div className="JobPage-form-field">
            <label htmlFor="WorkTime" className="JobPage-form-label">
              Work Time
            </label>
            <InputText
              id="WorkTime"
              name="WorkTime"
              value={formData.WorkTime}
              onChange={handleChange}
              className="JobPage-form-input"
              placeholder="e.g., 9am-5pm, Full-time, Part-time"
            />
          </div>

          {/* Salary and Charges Grid */}
          <div className="JobPage-form-grid">
            <div className="JobPage-form-field">
              <label htmlFor="salary" className="JobPage-form-label">
                Salary
              </label>
              <InputNumber
                id="salary"
                value={formData.salary}
                onValueChange={(e) => handleNumericChange(e, 'salary')}
                mode="decimal"
                minFractionDigits={2}
                maxFractionDigits={2}
                className="JobPage-form-input"
                placeholder="Enter salary amount"
              />
            </div>

            <div className="JobPage-form-field">
              <label htmlFor="serviceCharge" className="JobPage-form-label">
                Service Charge <span className="JobPage-required">*</span>
              </label>
              <InputNumber
                id="serviceCharge"
                value={formData.serviceCharge}
                onValueChange={(e) => handleNumericChange(e, 'serviceCharge')}
                mode="decimal"
                minFractionDigits={2}
                maxFractionDigits={2}
                className={`JobPage-form-input ${formErrors.serviceCharge ? 'JobPage-form-input-error' : ''}`}
                placeholder="0.00"
              />
              {formErrors.serviceCharge && <small className="JobPage-error-message">{formErrors.serviceCharge}</small>}
            </div>

            {/* <div className="JobPage-form-field">
              <label htmlFor="adminCharge" className="JobPage-form-label">
                Admin Charge <span className="JobPage-required">*</span>
              </label>
              <InputNumber 
                id="adminCharge" 
                value={formData.adminCharge} 
                onValueChange={(e) => handleNumericChange(e, 'adminCharge')} 
                mode="decimal" 
                minFractionDigits={2}
                maxFractionDigits={2}
                className={`JobPage-form-input ${formErrors.adminCharge ? 'JobPage-form-input-error' : ''}`}
                placeholder="0.00"
              />
              {formErrors.adminCharge && <small className="JobPage-error-message">{formErrors.adminCharge}</small>}
            </div> */}
          </div>

          {/* Country */}
          <div className="JobPage-form-field">
            <label htmlFor="country" className="JobPage-form-label">
              Country <span className="JobPage-required">*</span>
            </label>
            <Dropdown
              value={formData.country}
              options={countries}
              onChange={handleDropdown}
              placeholder="Select a Country"
              className={`JobPage-form-dropdown ${formErrors.country ? 'JobPage-form-input-error' : ''}`}
              filter
              showClear
            />
            {formErrors.country && <small className="JobPage-error-message">{formErrors.country}</small>}
          </div>

          {/* Last Date to Apply */}
          <div className="JobPage-form-field">
            <label htmlFor="lastDateToApply" className="JobPage-form-label">
              Last Date to Apply <span className="JobPage-required">*</span>
            </label>
            <Calendar
              id="lastDateToApply"
              value={formData.lastDateToApply}
              onChange={handleDateChange}
              dateFormat="dd/mm/yy"
              showIcon
              className={`JobPage-form-input ${formErrors.lastDateToApply ? 'JobPage-form-input-error' : ''}`}
              minDate={new Date()}
              placeholder="Select last date to apply"
            />
            {formErrors.lastDateToApply && <small className="JobPage-error-message">{formErrors.lastDateToApply}</small>}
          </div>

          <div className="JobPage-form-actions">
            <Button
              label="Cancel"
              className="JobPage-cancel-btn p-button-text"
              onClick={() => setDialogVisible(false)}
            />
            <Button
              label={isEdit ? "Update Job" : "Save Job"}
              className="JobPage-save-btn"
              onClick={handleSubmit}
              icon={isEdit ? "pi pi-check" : "pi pi-save"}
              disabled={!formData.jobTitle.trim() || !formData.country || !formData.lastDateToApply}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default JobPage;