import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../CSS/ReviewFormFull.css';
import { useLocation, useNavigate } from 'react-router-dom';

const ReviewFormFull = () => {
  const [data, setData] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // States for Pre-Visa Officer functionality
  const [showPreVisaPopup, setShowPreVisaPopup] = useState(false);
  const [preVisaOfficers, setPreVisaOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  const { state } = useLocation();
  const navigate = useNavigate();
  const id = state?._id;

  useEffect(() => {
    if (!state) {
      navigate('/leads');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/client-form/getbyid/${id}`);
        setData(res.data);
        setEditData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, state]);

  // Fetch Pre-Visa Officers when popup opens
  useEffect(() => {
    if (showPreVisaPopup) {
      const fetchPreVisaOfficers = async () => {
        try {
          setRequestError(null);
          const response = await axios.get('http://localhost:5000/api/pre-visa');
          setPreVisaOfficers(response.data);
        } catch (err) {
          console.error('Error fetching pre-visa officers:', err);
          setRequestError('Failed to load pre-visa officers');
        }
      };

      fetchPreVisaOfficers();
    }
  }, [showPreVisaPopup]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...data });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...data });
    setError(null);
  };

  const handleInputChange = (field, value) => {
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
    setSaving(true);
    setError(null);

    try {
      const res = await axios.put(`http://localhost:5000/api/client-form/update/${data._id}`, editData);
      setData(res.data.data);
      setEditData(res.data.data);
      setIsEditing(false);
      alert('Registration updated successfully!');
    } catch (err) {
      console.error('Error updating registration:', err);
      setError(err.response?.data?.message || 'Failed to update registration');
    } finally {
      setSaving(false);
    }
  };

  // Open Pre-Visa Officer popup
  const handleOpenPreVisaPopup = () => {
    setShowPreVisaPopup(true);
    setSelectedOfficer(null);
    setSearchTerm('');
    setRequestError(null);
    setRequestSuccess(null);
    setRequestMessage('');
  };

  // Close Pre-Visa Officer popup
  const handleClosePreVisaPopup = () => {
    setShowPreVisaPopup(false);
  };

  // Handle officer selection
  const handleOfficerSelect = (officer) => {
    setSelectedOfficer(officer);
  };

  // Send request to Pre-Visa Officer
  const handleSendRequest = async () => {
    if (!selectedOfficer) {
      setRequestError('Please select a Pre-Visa Officer');
      return;
    }

    setRequestLoading(true);
    setRequestError(null);

    try {
      const staffheadId = localStorage.getItem('staffHeadID');
      const formId = data._id;
      const preVisaOfficerId = selectedOfficer._id;

      const response = await axios.post('http://localhost:5000/api/options/add', {
        staffheadId,
        formId,
        preVisaOfficerId,
        message: requestMessage
      });

      setRequestSuccess('Request sent successfully!');
      setTimeout(() => {
        setShowPreVisaPopup(false);
      }, 1500);
    } catch (err) {
      console.error('Error sending request:', err);
      setRequestError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequestLoading(false);
    }
  };

  // Filter officers based on search term
  const filteredOfficers = preVisaOfficers.filter(officer =>
    officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!state) return null;
  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return <div className="no-data">No data available</div>;

  return (
    <div className="form-container">
      {/* Pre-Visa Officer Popup */}
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
                      <div className="officer-name">{officer.name}</div>
                      <div className="officer-email">{officer.email}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-officers">No pre-visa officers found</div>
                )}
              </div>

              {/* Message Textarea */}
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

              {requestError && <div className="error-message">{requestError}</div>}
              {requestSuccess && <div className="success-message">{requestSuccess}</div>}

              <div className="popup-actions">
                <button
                  className="send-request-btn"
                  onClick={handleSendRequest}
                  disabled={requestLoading || !selectedOfficer}
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
          <span className="form-reg-no"><strong>Registration No. :- </strong>{data.regNo}</span>
        </div>
      </div>

      {/* PERSONAL DETAILS */}
      <section className="form-section personal-details">
        <h4 className="section-title">
          <span className="section-bullet">•</span> Personal Details
        </h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name:</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control editable-input"
                value={editData.fullName || ''}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              />
            ) : (
              <div className="form-control">{data.fullName}</div>
            )}
          </div>

          <div className="form-group">
            <label>Father's Name:</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control editable-input"
                value={editData.fatherName || ''}
                onChange={(e) => handleInputChange('fatherName', e.target.value)}
              />
            ) : (
              <div className="form-control">{data.fatherName}</div>
            )}
          </div>

          <div className="form-group">
            <label>Address:</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control editable-input"
                value={editData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            ) : (
              <div className="form-control">{data.address}</div>
            )}
          </div>

          <div className="form-group">
            <label>State:</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control editable-input"
                value={editData.state || ''}
                onChange={(e) => handleInputChange('state', e.target.value)}
              />
            ) : (
              <div className="form-control">{data.state}</div>
            )}
          </div>

          <div className="form-group">
            <label>PIN Code:</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control editable-input"
                value={editData.pinCode || ''}
                onChange={(e) => handleInputChange('pinCode', e.target.value)}
              />
            ) : (
              <div className="form-control">{data.pinCode}</div>
            )}
          </div>

          <div className="form-group">
            <label>WhatsApp Number:</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control editable-input"
                value={editData.whatsAppNo || ''}
                onChange={(e) => handleInputChange('whatsAppNo', e.target.value)}
              />
            ) : (
              <div className="form-control">{data.whatsAppNo}</div>
            )}
          </div>

          <div className="form-group">
            <label>Family Number:</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control editable-input"
                value={editData.familyContact || ''}
                onChange={(e) => handleInputChange('familyContact', e.target.value)}
              />
            ) : (
              <div className="form-control">{data.familyContact}</div>
            )}
          </div>
          <div className="form-group">
            <label>Contact Number:</label>
            <div className="form-control">{data.contactNo}</div>
          </div>
          <div className="form-group full-width">
            <label>Email:</label>
            <div className="form-control">{data.email}</div>
          </div>
        </div>
      </section>

      {/* PASSPORT DETAILS */}
      <section className="form-section passport-details">
        <h4 className="section-title">
          <span className="section-bullet">•</span> Passport Details
        </h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Passport Number:</label>
            <div className="form-control">{data.passportNumber}</div>
          </div>

          <div className="form-group">
            <label>Date of Birth:</label>
            <div className="form-control">{new Date(data.dateOfBirth).toLocaleDateString()}</div>
          </div>

          <div className="form-group">
            <label>Passport Expiry Date:</label>
            <div className="form-control">{new Date(data.passportExpiry).toLocaleDateString()}</div>
          </div>

          <div className="form-group">
            <label>Nationality:</label>
            <div className="form-control">{data.nationality}</div>
          </div>

          <div className="form-group checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="ecr"
                checked={isEditing ? (editData.ecr || false) : data.ecr}
                onChange={isEditing ? (e) => handleInputChange('ecr', e.target.checked) : undefined}
                readOnly={!isEditing}
              />
              <label htmlFor="ecr">ECR</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="ecnr"
                checked={isEditing ? (editData.ecnr || false) : data.ecnr}
                onChange={isEditing ? (e) => handleInputChange('ecnr', e.target.checked) : undefined}
                readOnly={!isEditing}
              />
              <label htmlFor="ecnr">ECNR</label>
            </div>
          </div>
        </div>
      </section>

      {/* WORK DETAILS */}
      <section className="form-section work-details">
        <h4 className="section-title">
          <span className="section-bullet">•</span> Work Details
        </h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Occupation:</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control editable-input"
                value={editData.occupation || ''}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
              />
            ) : (
              <div className="form-control">{data.occupation}</div>
            )}
          </div>

          <div className="form-group">
            <label>Place of Deployment:</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control editable-input"
                value={editData.placeOfEmployment || ''}
                onChange={(e) => handleInputChange('placeOfEmployment', e.target.value)}
              />
            ) : (
              <div className="form-control">{data.placeOfEmployment}</div>
            )}
          </div>

          <div className="form-group">
            <label>Last Experience:</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control editable-input"
                value={editData.lastExperience || ''}
                onChange={(e) => handleInputChange('lastExperience', e.target.value)}
              />
            ) : (
              <div className="form-control">{data.lastExperience}</div>
            )}
          </div>

          <div className="form-group">
            <label>Last Salary & Post Details:</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control editable-input"
                value={editData.lastSalaryPostDetails || ''}
                onChange={(e) => handleInputChange('lastSalaryPostDetails', e.target.value)}
              />
            ) : (
              <div className="form-control">{data.lastSalaryPostDetails}</div>
            )}
          </div>

          <div className="form-group">
            <label>Expected Salary:</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control editable-input"
                value={editData.expectedSalary || ''}
                onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
              />
            ) : (
              <div className="form-control">{data.expectedSalary}</div>
            )}
          </div>

          <div className="form-group">
            <label>Medical Report:</label>
            <div className="form-control">{data.medicalReport}</div>
          </div>

          <div className="form-group">
            <label>Interview Status:</label>
            <div className="form-control">{data.InterviewStatus}</div>
          </div>

          <div className="form-group">
            <label>PCC Status:</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control editable-input"
                value={editData.pccStatus || ''}
                onChange={(e) => handleInputChange('pccStatus', e.target.value)}
              />
            ) : (
              <div className="form-control">{data.pccStatus}</div>
            )}
          </div>
        </div>
      </section>

      {/* FOR OFFICE USE ONLY */}
      <section className="form-section office-use">
        <h4 className="section-title">
          <span className="section-bullet">•</span> For Office Use Only
        </h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Agent Code:</label>
            <div className="form-control">{data.agentCode}</div>
          </div>

          <div className="form-group">
            <label>Country:</label>
            <div className="form-control">{data.officeConfirmation?.country.countryName}</div>
          </div>

          <div className="form-group">
            <label>Work:</label>
            <div className="form-control">{data.officeConfirmation?.work.jobTitle}</div>
          </div>

          <div className="form-group">
            <label>Salary: </label>
            <div className="form-control">{data.officeConfirmation?.salary}</div>
          </div>

          <div className="form-group">
            <label>Service Charge:</label>
            <div className="form-control">{data.officeConfirmation?.ServiceCharge}</div>
          </div>

          <div className="form-group">
            <label>Medical Charge:</label>
            <div className="form-control">{data.officeConfirmation?.MedicalCharge}</div>
          </div>
        </div>
      </section>

      <div className="form-footer">
        {!isEditing ? (
          <>
            <button className="print-button" onClick={() => window.print()}>
              Print Form
            </button>
            <button className="edit-button" onClick={handleEdit}>
              Edit
            </button>
            {/* New Button for Pre-Visa Officer Request */}
            <button className="pre-visa-request-button" onClick={handleOpenPreVisaPopup}>
              Request to Pre-Visa Officer
            </button>
          </>
        ) : (
          <>
            <button
              className="update-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update'}
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewFormFull;