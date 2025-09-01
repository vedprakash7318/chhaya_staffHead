import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ToastContainer, toast } from 'react-toastify';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

import 'react-toastify/dist/ReactToastify.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import '../CSS/ReviewForm.css';

function ReviewForm() {
  const [leads, setLeads] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 0 });

  const StaffHeadId = localStorage.getItem('staffHeadID');
  const navigate = useNavigate();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const page = lazyParams.page + 1;
      const limit = lazyParams.rows;

      const res = await axios.get(`http://localhost:5000/api/client-form/get-transferred/${StaffHeadId}`, {
        params: {
          page,
          limit,
          search: globalFilter
        }
      });
      console.log('====================================')
      console.log(res)
      console.log('====================================')
      setLeads(res.data.data);
      setTotalRecords(res.data.total);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [lazyParams, globalFilter]);

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

  const handleReview=()=>{
    
  }

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
                    onClick={() => handleReview()}
                  />

                </div>
              )}
              style={{ width: '100px' }}
            />
          </DataTable>
        </div>
      )}
    </div>
  );
}

export default ReviewForm;
