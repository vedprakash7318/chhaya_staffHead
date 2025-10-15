// ======================= IMPORTS =======================
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Tooltip } from "primereact/tooltip";
import { Tag } from "primereact/tag";
import Swal from "sweetalert2";

// ======================= STYLES =======================
import "react-toastify/dist/ReactToastify.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "../CSS/ReviewForm.css";


// ======================= COMPONENT =======================
function ReviewForm() {
  const API_URL = import.meta.env.VITE_API_URL;

  // ----------------------- STATE -----------------------
  const [leads, setLeads] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 0 });
  const [visible, setVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [preVisaOfficers, setPreVisaOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [officersLoading, setOfficersLoading] = useState(false);

  const StaffHeadId = localStorage.getItem("staffHeadID");
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);

  // ----------------------- AUTH REDIRECT -----------------------
  useEffect(() => {
    if (!StaffHeadId) navigate("/");
  }, [navigate, StaffHeadId]);

  // ----------------------- FETCH LEADS -----------------------
  const fetchLeads = async () => {
    try {
      setTableLoading(true);
      const page = lazyParams.page + 1;
      const limit = lazyParams.rows;

      const res = await axios.get(
        `${API_URL}/api/client-form/get-transferred/${StaffHeadId}`,
        { params: { page, limit, search: globalFilter } }
      );

      setLeads(res.data.data);
      setTotalRecords(res.data.total);
    } catch {
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [lazyParams]);

  // ----------------------- SEARCH HANDLER (Debounced) -----------------------
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setLazyParams((prev) => ({ ...prev, page: 0, first: 0 }));
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [globalFilter]);

  // ----------------------- FETCH PRE-VISA OFFICERS -----------------------
  const fetchPreVisaOfficers = async () => {
    try {
      setOfficersLoading(true);
      const res = await axios.get(`${API_URL}/api/pre-visa/`);
      setPreVisaOfficers(res.data);
    } catch {
      toast.error("Failed to fetch Pre-Visa Officers");
    } finally {
      setOfficersLoading(false);
    }
  };

  // ----------------------- REVIEW HANDLER -----------------------
  const handleReview = (lead) => {
    setSelectedLead(lead);
    setSelectedOfficer(null);
    setVisible(true);
    fetchPreVisaOfficers();
  };

  // ----------------------- TRANSFER HANDLER -----------------------
  const handleTransfer = async () => {
    if (!selectedOfficer) {
      toast.error("Please select a Pre-Visa Officer");
      return;
    }

    try {
      setTransferLoading(true);

      const payload = {
        clientFormId: selectedLead._id,
        staffHeadId: StaffHeadId,
        preVisaManagerId: selectedOfficer._id,
      };

      await axios.put(`${API_URL}/api/client-form/transfer-to-previsa`, payload);
      toast.success("Lead transferred successfully!");
      setVisible(false);
      fetchLeads();
    } catch {
      toast.error("Failed to transfer lead");
    } finally {
      setTransferLoading(false);
    }
  };

  // ----------------------- SEND CONFIRMATION HANDLER -----------------------
  const handleSendForConfirmation = async (leadId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to mark this agreement as sent?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, send it!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      const response = await axios.put(
        `${API_URL}/api/client-form/mark-send-confirmation/${leadId}`
      );

      toast.success(response.data.message || "Agreement marked successfully!");
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // ----------------------- HELPERS -----------------------
  const isTransferredForPreVisa = (lead) =>
    !!lead.transferredForPreVisaBy && lead.transferredForPreVisaBy !== null;

  const getTransferTooltip = (lead) => {
    if (isTransferredForPreVisa(lead)) {
      const transferredBy = lead.transferredForPreVisaBy.name || "Unknown";
      const transferredTo = lead.preVisaManagerId?.name || "Pre-Visa Officer";
      const transferredDate = new Date(
        lead.transferredForPreVisaDate
      ).toLocaleDateString();

      return `Transferred by: ${transferredBy}\nTo: ${transferredTo}\nDate: ${transferredDate}`;
    }
    return "";
  };

  // Render colored tags for status
  const renderStatusTags = (lead) => {
    console.log(lead);
    
    const tags = [];

    if (lead.isSendForConfirmation)
      tags.push({ value: "Transfer for Confirmation", severity: "info" });
    if (lead.isAgreementSend===true)
      tags.push({ value: "Agreement Sent", severity: "success" });
    if (lead.isConfirmationSend===true)
      tags.push({ value: "Confirmation Sent", severity: "success" });
    if (lead.isCancelSend===true)
      tags.push({ value: "Cancellation Sent", severity: "danger" });
    if (lead.medicalReport)
      tags.push({ value: lead.medicalReport, severity: "warning" });

    if (!tags.length) return <Tag value="Pending" severity="secondary" />;

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {tags.map((tag, i) => (
          <Tag key={i} value={tag.value} severity={tag.severity} />
        ))}
      </div>
    );
  };

  // ----------------------- TABLE HEADER -----------------------
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

  // ======================= RENDER =======================
  return (
    <div className="reviewLeads-container">
      <ToastContainer />

      {/* Loader */}
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
            loading={tableLoading}
            className="reviewLeads-table p-datatable-sm"
            emptyMessage="No leads found"
          >
            <Column field="fullName" header="Name" />
            <Column field="contactNo" header="Phone" />
            <Column field="transferredBy.name" header="Transferred By" />
            <Column
              header="Status"
              body={(rowData) => renderStatusTags(rowData)}
              style={{ width: "220px" }}
            />

            {/* ACTION BUTTONS */}
            <Column
              header="Action"
              style={{ width: "200px", textAlign: "center" }}
              body={(rowData) => {
                const isTransferred = isTransferredForPreVisa(rowData);
                const tooltipId = `tooltip-${rowData._id}`;
                const isConfirmationDone =
                  rowData.isAgreementSend &&
                  rowData.isConfirmationSend &&
                  rowData.isCancelSend;

                return (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    {/* VIEW BUTTON */}
                    <Button
                      icon="pi pi-eye"
                      className="p-button-rounded p-button-info p-button-sm"
                      onClick={() =>
                        navigate("/ReviewForm/ReviewFormFull", {
                          state: rowData,
                        })
                      }
                      id={`view-${rowData._id}`}
                    />
                    <Tooltip
                      target={`#view-${rowData._id}`}
                      content="View Details"
                      position="top"
                    />

                    {/* REVIEW / TRANSFER */}
                    {isTransferred ? (
                      <>
                        <Button
                          id={tooltipId}
                          icon="pi pi-check-circle"
                          className="p-button-rounded p-button-success p-button-sm"
                          disabled
                        />
                        <Tooltip
                          target={`#${tooltipId}`}
                          content={getTransferTooltip(rowData)}
                          position="top"
                        />
                      </>
                    ) : (
                      <>
                        <span id={`review-${rowData._id}`}>
                          <Button
                            icon="pi pi-check-circle"
                            className="p-button-rounded p-button-success p-button-sm"
                            onClick={() => handleReview(rowData)}
                            disabled={!isConfirmationDone}
                          />
                        </span>
                        <Tooltip
                          target={`#review-${rowData._id}`}
                          content={
                            !isConfirmationDone
                              ? "First Send Confirmation"
                              : "Transfer Lead"
                          }
                          position="top"
                        />
                      </>
                    )}

                    {/* SEND CONFIRMATION */}
                    <Button
                      icon={
                        isConfirmationDone
                          ? "pi pi-check"
                          : "pi pi-info-circle"
                      }
                      className={`p-button-rounded p-button-sm ${
                        isConfirmationDone
                          ? "p-button-success"
                          : "p-button-warning"
                      }`}
                      onClick={() =>
                        !isConfirmationDone &&
                        handleSendForConfirmation(rowData._id)
                      }
                      disabled={isConfirmationDone}
                      id={`info-${rowData._id}`}
                    />
                    <Tooltip
                      target={`#info-${rowData._id}`}
                      content={
                        isConfirmationDone
                          ? "All confirmation steps completed"
                          : "Send for Confirmation"
                      }
                      position="top"
                    />
                  </div>
                );
              }}
            />
          </DataTable>
        </div>
      )}

      {/* MODAL FOR TRANSFER */}
      <Dialog
        header="Review & Transfer Lead"
        visible={visible}
        style={{ width: "450px" }}
        modal
        onHide={() => setVisible(false)}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setVisible(false)}
              disabled={transferLoading}
            />
            <Button
              label="Transfer"
              icon="pi pi-share-alt"
              className="p-button-success"
              onClick={handleTransfer}
              loading={transferLoading}
              disabled={
                transferLoading ||
                !selectedLead ||
                !(
                  selectedLead.isAgreementSend &&
                  selectedLead.isConfirmationSend &&
                  selectedLead.isCancelSend
                )
              }
            />
          </div>
        }
      >
        {selectedLead ? (
          <div>
            <label>
              <strong>Select Pre-Visa Officer:</strong>
            </label>
            <div className="mt-3">
              {officersLoading ? (
                <div className="text-center">
                  <ProgressSpinner style={{ width: "30px", height: "30px" }} />
                </div>
              ) : (
                <Dropdown
                  value={selectedOfficer}
                  options={preVisaOfficers}
                  onChange={(e) => setSelectedOfficer(e.value)}
                  optionLabel="name"
                  placeholder="Search officer..."
                  filter
                  showClear
                  className="model-dropdown"
                />
              )}
            </div>
          </div>
        ) : (
          <p>No lead selected</p>
        )}
      </Dialog>
    </div>
  );
}

// ======================= EXPORT =======================
export default ReviewForm;
