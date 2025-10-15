import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../CSS/ReviewFormFull.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import AddOptionPage from './AddOption';

const ReviewFormFull = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [data, setData] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  
  const [optionsByYou, setOptionsByYou] = useState([]);
  const [optionsByYouLoading, setOptionsByYouLoading] = useState(false);

  const [expandedPreVisaOptions, setExpandedPreVisaOptions] = useState({});
  const [expandedYourOptions, setExpandedYourOptions] = useState({});

  const [showPreVisaPopup, setShowPreVisaPopup] = useState(false);
  const [preVisaOfficers, setPreVisaOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  const [isAddOptionDisabled, setIsAddOptionDisabled] = useState(false);
  const [isTransferred, setIsTransferred] = useState(false);

  const { state } = useLocation();
  const navigate = useNavigate();
  const id = state?._id;
  const staffHeadID = localStorage.getItem('staffHeadID');

  const medicalReportOptions = [
    { label: 'Fit', value: 'Fit' },
    { label: 'Unfit', value: 'Unfit' },
    { label: 'Pending', value: 'Pending' }
  ];

  useEffect(() => {
    if (!staffHeadID) {
      navigate('/');
    }
  }, [staffHeadID, navigate]);

  const hasPendingRequest = options.some(option =>
    option.requestedTo && !option.responseMessage
  );

  useEffect(() => {
    setIsAddOptionDisabled(options.length > 0 || hasPendingRequest);
  }, [options, hasPendingRequest]);

  useEffect(() => {
    if (id) {
      fetchOptions();
      fetchOptionsByYou();
    }
  }, [id]);

  const fetchOptions = async () => {
    setOptionsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/options/optionGet/${id}`);
      setOptions(res.data.data || []);
    } catch {
      setOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  };

  const fetchOptionsByYou = async () => {
    setOptionsByYouLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/options-staff/optionGet/${id}`);
      const responseData = res.data?.data || res.data;
      setOptionsByYou(Array.isArray(responseData) ? responseData : (responseData ? [responseData] : []));
    } catch {
      setOptionsByYou([]);
    } finally {
      setOptionsByYouLoading(false);
    }
  };

  useEffect(() => {
    if (!state) {
      navigate('/ReviewForm');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/client-form/getbyid/${id}`);
        setData(res.data);
        setEditData(res.data);
        
        // Check if file is transferred to Pre-Visa Manager
        if (res.data.transferredToPreVisaManager) {
          setIsTransferred(true);
        }
        
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, state]);

  useEffect(() => {
    if (showPreVisaPopup) {
      const fetchPreVisaOfficers = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/pre-visa`);
          setPreVisaOfficers(response.data || []);
        } catch {
          setPreVisaOfficers([]);
        }
      };
      fetchPreVisaOfficers();
    }
  }, [showPreVisaPopup]);

  const togglePreVisaOption = (index) => {
    setExpandedPreVisaOptions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleYourOption = (index) => {
    setExpandedYourOptions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleEdit = () => {
    if (isTransferred) return;
    setIsEditing(true);
    setEditData({ ...data });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...data });
  };

  const handleCloseDialog = () => {
    setShowAdd(false);
    fetchOptionsByYou();
  };
  
  const handleInputChange = (field, value) => {
    if (isTransferred) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    if (isTransferred) return;
    
    setSaving(true);
    try {
      const res = await axios.put(`${API_URL}/api/client-form/update/${data._id}`, editData);
      setData(res.data.data);
      setEditData(res.data.data);
      setIsEditing(false);
      toast.success("Updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    } catch {
      toast.error("Failed to update!", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPreVisaPopup = () => {
    if (isTransferred) return;
    setShowPreVisaPopup(true);
    setSelectedOfficer(null);
    setSearchTerm('');
    setRequestMessage('');
  };

  const handleClosePreVisaPopup = () => {
    setShowPreVisaPopup(false);
  };

  const handleOfficerSelect = (officer) => {
    setSelectedOfficer(officer);
  };

  const handleSendRequest = async () => {
    if (!selectedOfficer || isTransferred) return;

    setRequestLoading(true);
    try {
      const staffheadId = localStorage.getItem('staffHeadID');
      const formId = data._id;
      const preVisaOfficerId = selectedOfficer._id;

      await axios.post(`${API_URL}/api/options/add`, {
        staffheadId,
        formId,
        preVisaOfficerId,
        message: requestMessage
      });

      fetchOptions();
      toast.success("Request sent successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
      setTimeout(() => setShowPreVisaPopup(false), 1000);
    } catch {
      toast.error("Failed to send request!", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    } finally {
      setRequestLoading(false);
    }
  };

  const handleAddOption = () => {
    if (isTransferred) return;
    setShowAdd(true);
  };

  const filteredOfficers = preVisaOfficers.filter(officer =>
    officer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderField = (label, value, field, type = 'text') => (
    <div className={`form-group ${isEditing ? 'editable-field' : ''} ${isTransferred ? 'transferred-field' : ''}`}>
      <label>{label}:</label>
      {isEditing ? (
        type === 'select' ? (
          <select
            className="form-control editable-input"
            value={editData[field] || 'Pending'}
            onChange={(e) => handleInputChange(field, e.target.value)}
            disabled={isTransferred}
          >
            {medicalReportOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            className="form-control editable-input"
            value={editData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            disabled={field === 'expectedSalary' || isTransferred}
          />
        )
      ) : (
        <div className="form-control">{value || 'N/A'}</div>
      )}
    </div>
  );

  const renderOptionDetail = (label, value) => value && (
    <div className="job-detail-item">
      <label>{label}:</label>
      <span className="value">{value}</span>
    </div>
  );

  // Tooltip component for disabled buttons
  const DisabledButtonWithTooltip = ({ children, title, ...props }) => (
    <div className="tooltip-container">
      <button {...props} disabled>
        {children}
      </button>
      {isTransferred && (
        <div className="tooltip-text">File has been transferred to Pre-Visa Manager</div>
      )}
    </div>
  );

  if (!state) return null;
  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!data) return <div className="no-data">No data available</div>;

  return (
    <div className="form-container">
      {isTransferred && (
        <div className="transfer-banner">
          <div className="transfer-message">
            ⚠️ This file has been transferred to Pre-Visa Manager and is no longer editable
          </div>
        </div>
      )}

      <div className="navigation-header">
        <button className="back-button" onClick={() => navigate('/ReviewForm')}>
          ← Back to Leads
        </button>
      </div>

      {showPreVisaPopup && (
        <div className="popup-overlay">
          <div className="pre-visa-popup">
            <div className="popup-header">
              <h3>Select Pre-Visa Officer</h3>
              <button className="close-popup" onClick={handleClosePreVisaPopup}>×</button>
            </div>
            <div className="popup-content">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="officers-list">
                {filteredOfficers.length > 0 ? (
                  filteredOfficers.map(officer => (
                    <div
                      key={officer._id}
                      className={`officer-item ${selectedOfficer?._id === officer._id ? 'selected' : ''}`}
                      onClick={() => handleOfficerSelect(officer)}
                    >
                      <div className="officer-name">{officer.name || 'N/A'}</div>
                      <div className="officer-email">{officer.email || 'N/A'}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-officers">No pre-visa officers found</div>
                )}
              </div>
              <div className="message-section">
                <label>Message (Optional):</label>
                <textarea
                  className="request-message"
                  placeholder="Add any additional information or instructions for the Pre-Visa Officer..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows="4"
                />
              </div>
              <div className="popup-actions">
                <button
                  className="send-request-btn"
                  onClick={handleSendRequest}
                  disabled={requestLoading || !selectedOfficer || isTransferred}
                >
                  {requestLoading ? 'Sending...' : 'Send Request'}
                </button>
                <button className="cancel-btn" onClick={handleClosePreVisaPopup}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="form-header">
        <div className="company-info">
          <h2>Chhaya International Pvt. Ltd.</h2>
          <p>LIG 2 Nehru Nagar Unnao</p>
          <p>Uttar Pradesh 209801</p>
          <p>Email: chhayainternationalpvtltd@gmail.com</p>
          <p>Contact No.: 8081478427</p>
        </div>
        <div className="client-images">
          <div className="image-box">
            <label>Client Photo:</label>
            <img src={data.photo || '/placeholder-user.jpg'} alt="Client" className="client-photo" />
          </div>
          <div className="image-box">
            <label>Client Signature:</label>
            <img src={data.Sign || '/placeholder-signature.png'} alt="Signature" className="client-signature" />
          </div>
        </div>
      </div>

      <div className="form-title-section">
        <h3 className="form-title">Registration Form</h3>
        <div className="form-meta">
          <span className="form-date"><strong>Date:</strong> {new Date(data.createdAt).toLocaleDateString()}</span>
          <span className="form-reg-no"><strong>Registration No. :- </strong>{data.regNo || 'N/A'}</span>
        </div>
      </div>

      <section className="form-section personal-details">
        <h4 className="section-title"><span className="section-bullet">•</span> Personal Details</h4>
        <div className="form-grid">
          {renderField('Full Name', data.fullName, 'fullName')}
          {renderField('Father\'s Name', data.fatherName, 'fatherName')}
          {renderField('Address', data.address, 'address')}
          {renderField('State', data.state, 'state')}
          {renderField('PIN Code', data.pinCode, 'pinCode', 'number')}
          {renderField('WhatsApp Number', data.whatsAppNo, 'whatsAppNo', 'number')}
          {renderField('Family Number', data.familyContact, 'familyContact', 'number')}
          <div className="form-group">
            <label>Contact Number:</label>
            <div className="form-control">{data.contactNo || 'N/A'}</div>
          </div>
          <div className="form-group full-width">
            <label>Email:</label>
            <div className="form-control">{data.email || 'N/A'}</div>
          </div>
        </div>
      </section>

      <section className="form-section passport-details">
        <h4 className="section-title"><span className="section-bullet">•</span> Passport Details</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Passport Number:</label>
            <div className="form-control">{data.passportNumber || 'N/A'}</div>
          </div>
          <div className="form-group">
            <label>Date of Birth:</label>
            <div className="form-control">{data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
          </div>
          <div className="form-group">
            <label>Passport Expiry Date:</label>
            <div className="form-control">{data.passportExpiry ? new Date(data.passportExpiry).toLocaleDateString() : 'N/A'}</div>
          </div>
          <div className="form-group">
            <label>Nationality:</label>
            <div className="form-control">{data.nationality || 'N/A'}</div>
          </div>
          <div className="form-group">
            <label>Passport Type:</label>
            <div className="form-control">{data.passportType || 'N/A'}</div>
          </div>
        </div>
      </section>

      <section className="form-section work-details">
        <h4 className="section-title"><span className="section-bullet">•</span> Work Details</h4>
        <div className="form-grid">
          {renderField('Occupation', data.occupation, 'occupation')}
          {renderField('Place of Deployment', data.placeOfEmployment, 'placeOfEmployment')}
          {renderField('Last Experience', data.lastExperience, 'lastExperience')}
          {renderField('Last Salary & Post Details', data.lastSalaryPostDetails, 'lastSalaryPostDetails')}
          {renderField('PCC Status', data.pccStatus, 'pccStatus')}
          {renderField('Expected Salary', data.expectedSalary, 'expectedSalary')}
          {renderField('Medical Report', data.medicalReport, 'medicalReport', 'select')}
          <div className="form-group">
            <label>Interview Status:</label>
            <div className="form-control">{data.InterviewStatus || 'N/A'}</div>
          </div>
          <div className="form-group">
            <label>First Service Charge:</label>
            <div className="form-control">{data.ServiceChargeByTeam || 'N/A'}</div>
          </div>
          <div className="form-group">
            <label>Medical Charge:</label>
            <div className="form-control">{data.officeConfirmation?.MedicalCharge || 'N/A'}</div>
          </div>
        </div>
      </section>

      <section className="form-section office-use">
        <h4 className="section-title"><span className="section-bullet">•</span> For Office Use Only</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Agent Code:</label>
            <div className="form-control">{data.agentCode || 'N/A'}</div>
          </div>
          <div className="form-group">
            <label>Salary:</label>
            <div className="form-control">{data.officeConfirmation?.salary || 'N/A'}</div>
          </div>
          <div className="form-group">
            <label>Service Charge:</label>
            <div className="form-control">{data.officeConfirmation?.ServiceCharge || 'N/A'}</div>
          </div>
        </div>
      </section>

      <section className="form-section options-section">
        <h4 className="section-title"><span className="section-bullet">•</span> Options (Pre-Visa Officer)</h4>
        {optionsLoading ? (
          <div className="loading-spinner">Loading options...</div>
        ) : options.length > 0 ? (
          <div className="options-accordion">
            {options.map((option, index) => (
              <div key={option._id} className="accordion-item">
                <div className="accordion-header" onClick={() => togglePreVisaOption(index)}>
                  <div className="accordion-title">
                    <span className="option-sr-no">Option {index + 1}</span>
                    <span className="option-date">
                      Created: {option.createdAt ? new Date(option.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }) : 'N/A'}
                    </span>
                  </div>
                  <div className="accordion-icon">{expandedPreVisaOptions[index] ? '−' : '+'}</div>
                </div>
                {expandedPreVisaOptions[index] && (
                  <div className="accordion-content">
                    <div className="option-details">
                      <div className="user-info-section">
                        <div className="user-info-item">
                          <label>👤 Requested By: </label>
                          <span className="name">{option.requestedBy?.name || 'N/A'}</span>
                        </div>
                        <div className="user-info-item">
                          <label>👤 Requested To: </label>
                          <span className="name">{option.requestedTo?.name || 'N/A'}</span>
                        </div>
                      </div>
                      {option.requestMessage && (
                        <div className="message-section">
                          <label>💬 Request Message:</label>
                          <div className="message-content">{option.requestMessage}</div>
                        </div>
                      )}
                      {option.options && (
                        <div className="job-details-section">
                          <div className="job-details-header">💼 Job Details</div>
                          <div className="job-details-grid">
                            {renderOptionDetail('Job Title', option.options.jobTitle)}
                            {renderOptionDetail('Salary', option.options.salary ? `₹${option.options.salary}` : null)}
                            {renderOptionDetail('Work Time', option.options.WorkTime)}
                            {renderOptionDetail('Country', option.options.country?.countryName)}
                            {renderOptionDetail('Service Charge', option.options.serviceCharge ? `₹${option.options.serviceCharge}` : null)}
                            {option.options.description && (
                              <div className="job-detail-item job-description">
                                <label>Description:</label>
                                <div className="value">{option.options.description}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {option.responseMessage && (
                        <div className="response-section">
                          <label>💭 Response Message:</label>
                          <div className="message-content">{option.responseMessage}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-options">No options given</div>
        )}
      </section>

      <section className="form-section options-section">
        <h4 className="section-title"><span className="section-bullet">•</span> Options By You</h4>
        {optionsByYouLoading ? (
          <div className="loading-spinner">Loading your options...</div>
        ) : optionsByYou.length > 0 ? (
          <div className="options-accordion">
            {optionsByYou.map((option, index) => (
              <div key={option._id || index} className="accordion-item">
                <div className="accordion-header" onClick={() => toggleYourOption(index)}>
                  <div className="accordion-title">
                    <span className="option-sr-no">Your Option {index + 1}</span>
                    <span className="option-date">
                      Created: {option.createdAt ? new Date(option.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }) : 'N/A'}
                    </span>
                  </div>
                  <div className="accordion-icon">{expandedYourOptions[index] ? '−' : '+'}</div>
                </div>
                {expandedYourOptions[index] && (
                  <div className="accordion-content">
                    <div className="option-details">
                      <div className="job-details-section">
                        <div className="job-details-header">💼 Your Job Details</div>
                        <div className="job-details-grid">
                          {renderOptionDetail('Trade/Occupation', 
                            option.options?.jobTitle || option.jobTitle
                          )}
                          {renderOptionDetail('Salary', 
                            (option.options?.salary || option.salary) ? `₹${option.options?.salary || option.salary}` : null
                          )}
                          {renderOptionDetail('Country', 
                            option.options?.country?.countryName || 
                            option.country?.countryName || 
                            option.country?.name
                          )}
                          {renderOptionDetail('Duty Hours', 
                            (option.options?.WorkTime || option.WorkTime) ? `₹${option.options?.WorkTime || option.WorkTime}` : null
                          )}
                          {renderOptionDetail('Service Charge', 
                            (option.options?.serviceCharge || option.serviceCharge) ? `₹${option.options?.serviceCharge || option.serviceCharge}` : null
                          )}
                          {option.options?.description && (
                            <div className="job-detail-item job-description">
                              <label>Description:</label>
                              <div className="value">{option.options.description}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-options">No options given</div>
        )}
      </section>

      <div className="form-footer">
        {!isEditing ? (
          <>
            <button className="print-button" onClick={() => window.print()}>Print Form</button>
            
            {isTransferred ? (
              <DisabledButtonWithTooltip className="edit-button">
                Edit
              </DisabledButtonWithTooltip>
            ) : (
              <button className="edit-button" onClick={handleEdit}>Edit</button>
            )}
            
            {isTransferred ? (
              <DisabledButtonWithTooltip className="p-button">
                Add Option
              </DisabledButtonWithTooltip>
            ) : (
              <Button 
                label="Add Option" 
                onClick={handleAddOption} 
                disabled={isAddOptionDisabled}
                title={isAddOptionDisabled ? 
                  "Add Option is disabled when Pre-Visa Officer request is pending or options are received" : 
                  "Add Option"}
              />
            )}
            
            {isTransferred ? (
              <DisabledButtonWithTooltip className="pre-visa-request-button">
                Request to Pre-Visa Officer
              </DisabledButtonWithTooltip>
            ) : (
              <button
                className="pre-visa-request-button"
                onClick={handleOpenPreVisaPopup}
                disabled={hasPendingRequest}
              >
                {hasPendingRequest ? 'Request Pending...' : 'Request to Pre-Visa Officer'}
              </button>
            )}
          </>
        ) : (
          <>
            {isTransferred ? (
              <DisabledButtonWithTooltip className="update-button">
                Update
              </DisabledButtonWithTooltip>
            ) : (
              <button className="update-button" onClick={handleSave} disabled={saving}>
                {saving ? 'Updating...' : 'Update'}
              </button>
            )}
            
            <button className="cancel-button" onClick={handleCancel}>Cancel</button>
          </>
        )}
      </div>
      
      <Dialog
        header="Add Option"
        visible={showAdd}
        style={{ width: "40vw" }}
        onHide={() => setShowAdd(false)}  
      >
        <AddOptionPage formID={id} staffHeadID={staffHeadID} onSuccessClose={handleCloseDialog}/>
      </Dialog>
    </div>
  );
}

export default ReviewFormFull;