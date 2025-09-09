import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ToastContainer, toast } from 'react-toastify';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from 'react-router-dom';

import 'react-toastify/dist/ReactToastify.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import '../CSS/ReviewForm.css';

function ReviewForm() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [leads, setLeads] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 0 });
  const [visible, setVisible] = useState(false);   
  const [selectedLead, setSelectedLead] = useState(null); 
  const [preVisaOfficers, setPreVisaOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(null);

  const StaffHeadId = localStorage.getItem('staffHeadID');
  const AdminID = localStorage.getItem('AdminID');
  const navigate = useNavigate();
      useEffect(()=>{
      if(!localStorage.getItem('staffHeadID')){
        navigate('/')
      }
    })

  const fetchLeads = async () => {  
    try {
      setLoading(true);
      const page = lazyParams.page + 1;
      const limit = lazyParams.rows;

      const res = await axios.get(`${API_URL}/api/client-form/get-transferred/${StaffHeadId}`, {
        params: { page, limit, search: globalFilter }
      });
      setLeads(res.data.data);
      setTotalRecords(res.data.total);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreVisaOfficers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pre-visa/`); // adjust your route
      console.log(res);
      
      setPreVisaOfficers(res.data); // assuming response is { data: [officers] }
    } catch (error) {
      toast.error("Failed to fetch Pre-Visa Officers");
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [lazyParams, globalFilter]);

  const handleReview = (lead) => {
    setSelectedLead(lead);
    setSelectedOfficer(null); // reset
    setVisible(true);
    fetchPreVisaOfficers();
  };

const handleTransfer = async () => {
  if (!selectedOfficer) {
    toast.error("Please select a Pre-Visa Officer");
    return;
  }

   const payload = {
      formId: selectedLead._id,        // lead form id
      staffHeadId: StaffHeadId,        // from localStorage
      preVisaOfficerId: selectedOfficer._id, // dropdown selected officer
    };
    console.log(payload);
    
  try {
    const payload = {
      clientFormId: selectedLead._id,        // lead form id
      staffHeadId: StaffHeadId,        // from localStorage
      preVisaManagerId: selectedOfficer._id, // dropdown selected officer
    };

    const res = await axios.put(
      `${API_URL}/api/client-form/transfer-to-previsa`,
      payload
    );
    toast.success("Lead transferred successfully!");
    setVisible(false);
    fetchLeads(); // refresh after transfer
  } catch (error) {
    toast.error("Failed to transfer lead");
  }
};


  const header = (
    <div className="reviewLeads-header-container">
      <div className="reviewLeads-header-left">
        <h2 className="reviewLeads-page-title">Uploaded Leads</h2>
      </div>
      <div className="reviewLeads-header-right">
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search by name or phone"
          className="reviewLeads-search-box"
        />
      </div>
    </div>
  );

  return (
    <div className="reviewLeads-container">
      <ToastContainer />
      {loading ? (
        <div className="reviewLeads-spinner-container">
          <ProgressSpinner />
        </div>
      ) : (
        <div className="reviewLeads-table-wrapper">
          {header}
          <DataTable
            value={leads}
            lazy
            paginator
            totalRecords={totalRecords}
            rows={lazyParams.rows}
            first={lazyParams.first}
            onPage={(e) => setLazyParams(e)}
            responsiveLayout="scroll"
            scrollable
            scrollHeight="400px"
            globalFilter={globalFilter}
            className="reviewLeads-table p-datatable-sm"
            emptyMessage="No leads found"
          >
            <Column
              header="Photo"
              body={(rowData) => (
                <img
                  src={rowData.photo}
                  alt="lead"
                  className="reviewLeads-photo"
                />
              )}
              style={{ width: '80px' }}
            />
            <Column field="fullName" header="Name" />
            <Column field="email" header="Email" />
            <Column field="contactNo" header="Phone" />
            <Column field="transferredBy.name" header="Transferred By" />
            <Column
              header="Action"
              body={(rowData) => (
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button
                    label="View"
                    icon="pi pi-eye"
                    className="p-button-info p-button-sm reviewLeads-view-btn"
                    onClick={() => navigate('/Leads/ReviewFormFull', { state: rowData })}
                  />
                  <Button
                    label="Reviewed"
                    icon="pi pi-check-circle"
                    className="p-button-success p-button-sm reviewLeads-view-btn"
                    onClick={() => handleReview(rowData)}
                  />
                </div>
              )}
              style={{ width: '100px' }}
            />
          </DataTable>
        </div>
      )}

      {/* Modal */}
      <Dialog
        header="Review & Transfer Lead"
        visible={visible}
        style={{ width: '450px' }}
        modal
        onHide={() => setVisible(false)}
        footer={
          <div>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setVisible(false)} />
            <Button
              label="Transfer"
              icon="pi pi-share-alt"
              className="p-button-success"
              onClick={handleTransfer}
            />
          </div>
        }
      >
        {selectedLead ? (
          <div>
           
              <label><strong>Select Pre-Visa Officer:</strong></label>
            <div className="mt-3">
              <Dropdown
                value={selectedOfficer}
                options={preVisaOfficers}
                onChange={(e) => setSelectedOfficer(e.value)}
                optionLabel="name"
                placeholder="Search officer..."
                filter
                showClear
                className="w-full mt-2"
              />
            </div>
          </div>
        ) : (
          <p>No lead selected</p>
        )}
      </Dialog>
    </div>
  );
}

export default ReviewForm;
