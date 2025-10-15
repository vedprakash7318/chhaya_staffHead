import React, { useEffect, useState, useRef } from 'react';
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
import Swal from 'sweetalert2';

import 'react-toastify/dist/ReactToastify.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import '../CSS/Leads.css';

function Leads() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [leads, setLeads] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [callingTeam, setCallingTeam] = useState([]);
  const [assignDialogVisible, setAssignDialogVisible] = useState(false);
  const [selectedCallingTeam, setSelectedCallingTeam] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 0 });
  const [assignLoading, setAssignLoading] = useState(false);
  const [deassignLoading, setDeassignLoading] = useState(false);
  const [callingTeamLoading, setCallingTeamLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const searchInputRef = useRef(null);
  const StaffHeadId = localStorage.getItem('staffHeadID');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!localStorage.getItem('staffHeadID')) {
      navigate('/');
    }
  }, [navigate]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const page = lazyParams.page + 1;
      const limit = lazyParams.rows;

      const res = await axios.get(`${API_URL}/api/contact/get-transferredTo-leads/${StaffHeadId}`, {
        params: {
          page,
          limit,
          search: globalFilter
        }
      });

      setLeads(res.data.data);
      setTotalRecords(res.data.total);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchCallingTeam = async () => {
    try {
      setCallingTeamLoading(true);
      const res = await axios.get(`${API_URL}/api/calling-team/get-by-addedBy/${StaffHeadId}`);
      setCallingTeam(res.data);
    } catch (error) {
      toast.error('Failed to fetch calling team');
    } finally {
      setCallingTeamLoading(false);
    }
  };

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for search
    const timeout = setTimeout(() => {
      fetchLeads();
    }, 500); // 500ms delay for search
    
    setSearchTimeout(timeout);
    
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [lazyParams, globalFilter]);

  useEffect(() => {
    fetchCallingTeam();
  }, []);

  const handleSearchChange = (e) => {
    setGlobalFilter(e.target.value);
    setLazyParams({ ...lazyParams, first: 0, page: 0 }); // Reset to first page when searching
  };

  const srNoTemplate = (rowData, { rowIndex }) => lazyParams.first + rowIndex + 1;

  const handleAssign = async () => {
    if (!selectedCallingTeam) {
      toast.error('Please select a calling team member');
      return;
    }

    const assignmentData = {
      leadIds: selectedLeads.map((lead) => lead._id),
      callingTeamId: selectedCallingTeam._id,
      staffHeadId: StaffHeadId
    };

    try {
      setAssignLoading(true);
      const response = await axios.post(`${API_URL}/api/contact/assign-leads`, assignmentData);
      toast.success(response.data.message);
      setAssignDialogVisible(false);
      setSelectedCallingTeam(null);
      setSelectedLeads([]);
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign leads');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDeassign = async () => {
    // SweetAlert confirmation dialog before deassigning
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to deassign ${selectedLeads.length} lead(s)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, deassign them!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }

    const deassignmentData = {
      leadIds: selectedLeads.map((lead) => lead._id)
    };

    try {
      setDeassignLoading(true);
      const response = await axios.post(`${API_URL}/api/contact/deassign-leads`, deassignmentData);
      
      // Show success message with SweetAlert
      await Swal.fire({
        title: 'Success!',
        text: response.data.message,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setSelectedLeads([]);
      fetchLeads();
    } catch (error) {
      // Show error message with SweetAlert
      await Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to deassign leads',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setDeassignLoading(false);
    }
  };

  const header = (
    <div className="header-container">
      <div className="header-left">
        <h2 className="page-title">Uploaded Leads</h2>
        <div className="search-container">
          <InputText
            ref={searchInputRef}
            value={globalFilter}
            onChange={handleSearchChange}
            placeholder="Search number"
            className="search-box"
          />
          {loading && <ProgressSpinner className="search-spinner" strokeWidth="4" />}
        </div>
      </div>
      <div className="header-right">
        <>
          <Button
            label="Assign"
            icon="pi pi-user-plus"
            className="action-button success"
            onClick={() => setAssignDialogVisible(true)}
            disabled={selectedLeads.length === 0 || assignLoading || deassignLoading}
            loading={assignLoading}
          />
          <Button
            label="Deassign"
            icon="pi pi-user-minus"
            className="action-button danger"
            onClick={handleDeassign}
            disabled={selectedLeads.length === 0 || deassignLoading || assignLoading}
            loading={deassignLoading}
          />
        </>
      </div>
    </div>
  );

  return (
    <div className="leads-container">
      <ToastContainer />
      {loading && leads.length === 0 ? (
        <div className="spinner-container">
          <ProgressSpinner />
          
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            {header}
            <DataTable
              value={leads}
              lazy
              paginator
              totalRecords={totalRecords}
              rows={lazyParams.rows}
              first={lazyParams.first}
              onPage={(e) => setLazyParams(e)}
              globalFilter={globalFilter}
              responsiveLayout="scroll"
              scrollable
              scrollHeight="400px"
              selection={selectedLeads}
              onSelectionChange={(e) => setSelectedLeads(e.value)}
              dataKey="_id"
              selectionMode="checkbox"
              showGridlines
              emptyMessage="No leads found"
              className="p-datatable-sm"
              loading={loading}
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
              <Column header="Sr No." body={srNoTemplate} />
              <Column field="number" header="Phone" />
              <Column field="zone.zoneName" header="Zone" />
              <Column field="uploadedBy.name" header="Uploaded By" />
              <Column
                field="AssignedTO.name"
                header="Assigned To"
                body={(rowData) => rowData.AssignedTO?.name || 'Not Assigned'}
              />
              <Column
                field="AssignedDate"
                header="Assigned Date"
                body={(rowData) =>
                  rowData.AssignedDate ? new Date(rowData.AssignedDate).toLocaleDateString() : '-'
                }
              />
            </DataTable>
          </div>

          <Dialog
            header="Assign Leads"
            visible={assignDialogVisible}
            onHide={() => setAssignDialogVisible(false)}
            style={{ width: '35vw' }}
            className="assign-dialog"
            modal
          >
            <div className="dialog-content">
              <div className="dialog-field">
                <label>Select Calling Team:</label>
                {callingTeamLoading ? (
                  <div className="dropdown-loading">
                    <ProgressSpinner strokeWidth="4" />
                    <span>Loading team members...</span>
                  </div>
                ) : (
                  <Dropdown
                    value={selectedCallingTeam}
                    onChange={(e) => setSelectedCallingTeam(e.value)}
                    options={callingTeam}
                    optionLabel="name"
                    placeholder="Select..."
                    filter
                    showClear
                    className="w-full"
                  />
                )}
              </div>
              <div className="dialog-info">
                <p>Total selected leads: <strong>{selectedLeads.length}</strong></p>
              </div>
              <div className="dialog-actions">
                <Button 
                  label="Cancel" 
                  icon="pi pi-times" 
                  className="p-button-secondary" 
                  onClick={() => setAssignDialogVisible(false)} 
                  disabled={assignLoading}
                />
                <Button 
                  label="Assign" 
                  icon="pi pi-check" 
                  className="p-button-success" 
                  onClick={handleAssign} 
                  loading={assignLoading}
                />
              </div>
            </div>
          </Dialog>
        </>
      )}
    </div>
  );
}

export default Leads;