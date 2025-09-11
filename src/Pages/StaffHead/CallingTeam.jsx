import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Card } from 'primereact/card';
import { Toolbar } from 'primereact/toolbar';
import { Tag } from 'primereact/tag';
import { Avatar } from 'primereact/avatar';
import { Skeleton } from 'primereact/skeleton';
import 'react-toastify/dist/ReactToastify.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import '../CSS/CallingTeam.css'
import { useNavigate } from 'react-router-dom';

const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

const CallingTeam = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [team, setTeam] = useState([]);
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const staffHeadID = localStorage.getItem("staffHeadID");

  const [form, setForm] = useState({
    name: '',
    phone: '',
    gender: '',
    email: '',
    password: '',
    city: '',
    addedBy: staffHeadID
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('staffHeadID')) {
      navigate('/');
    }
  }, [navigate]);

  // Fetch all members
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/calling-team/get-by-addedBy/${staffHeadID}`);
      setTeam(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle add or update
  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/calling-team/update/${editingId}`, form);
        toast.success('Updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/calling-team/add`, form);
        toast.success('Added successfully!');
      }
      setVisible(false);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error('Submission failed');
    }
  };

  // Reset form state
  const resetForm = () => {
    setForm({ name: '', phone: '', gender: '', email: '', password: '', city: '', addedBy: staffHeadID });
    setEditingId(null);
  };

  // Open edit dialog
  const handleEdit = (member) => {
    setForm({
      name: member.name,
      phone: member.phone,
      gender: member.gender,
      email: member.email,
      password: member.password,
      city: member.city,
      addedBy: staffHeadID
    });
    setEditingId(member._id);
    setVisible(true);
  };

  // Delete with SweetAlert2 confirmation
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the member.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/api/calling-team/delete/${id}`);
          toast.success('Deleted successfully!');
          fetchData();
        } catch {
          toast.error('Delete failed');
        }
      }
    });
  };

  // Simple view alert
  const handleView = ({ name, phone, email, city, gender }) => {
    Swal.fire({
      title: name,
      html: `
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Gender:</strong> ${gender}</p>
      `,
      confirmButtonColor: '#3B82F6',
    });
  };
  // Gender template with tag
  const genderTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.gender}
        severity={rowData.gender === 'Female' ? 'warning' : 'info'}
      />
    );
  };

  // Action buttons
  const actionBody = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-text p-button-info"
        onClick={() => handleView(row)}
        tooltip="View Details"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-text p-button-warning"
        onClick={() => handleEdit(row)}
        tooltip="Edit"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-danger"
        onClick={() => handleDelete(row._id)}
        tooltip="Delete"
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  );

  // Loading skeleton
  const loadingTemplate = () => {
    return <Skeleton width="100%" height="1.5rem" />;
  };

  // Left side of toolbar
  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-column">
        <h2 className="text-2xl font-bold m-0 text-700">Calling Team</h2>
        <span className="text-sm text-600">Manage your team members</span>
      </div>
    );
  };

  // Right side of toolbar
  const rightToolbarTemplate = () => {
    return (
      <Button
        label="Add Member"
        icon="pi pi-plus"
        className="p-button-primary"
        onClick={() => { resetForm(); setVisible(true); }}
      />
    );
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <Card className="shadow-1 mb-4">
        <Toolbar className="mb-3" left={leftToolbarTemplate} right={rightToolbarTemplate} />

        <DataTable
          value={team}
          paginator
          rows={10}
          responsiveLayout="scroll"
          stripedRows
          loading={loading}
          emptyMessage="No team members found."
          className="p-datatable-sm"
        >
          <Column field="name" header="Name" />
          <Column field="phone" header="Phone" />
          <Column field="gender" header="Gender" body={genderTemplate} />
          <Column field="email" header="Email" />
          <Column field="password" header="Password" />
          <Column field="city" header="City" />
          <Column
            header="Actions"
            body={actionBody}
            style={{ textAlign: 'center', width: '12rem' }}
            bodyStyle={{ textAlign: 'center' }}
          />
        </DataTable>
      </Card>

      <Dialog
        header={editingId ? 'Edit Team Member' : 'Add Team Member'}
        visible={visible}
        style={{ width: '90vw', maxWidth: '500px' }}
        onHide={() => setVisible(false)}
        dismissableMask
      >
        <div className="flex flex-col gap-3 mt-3">
          <div className="p-field">
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <InputText
              id="name"
              name="name"
              placeholder="Enter full name"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
            <InputText
              id="phone"
              name="phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <InputText
              id="email"
              name="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <InputText
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="gender" className="block text-sm font-medium mb-1">Gender</label>
            <Dropdown
              id="gender"
              value={form.gender}
              options={genderOptions}
              onChange={e => setForm(prev => ({ ...prev, gender: e.value }))}
              placeholder="Select Gender"
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
            <InputText
              id="city"
              name="city"
              placeholder="Enter city"
              value={form.city}
              onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
              className="w-full"
            />
          </div>

          <div className="flex justify-content-end gap-2 mt-3">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setVisible(false)}
            />
            <Button
              label={editingId ? 'Update' : 'Add Member'}
              icon={editingId ? "pi pi-check" : "pi pi-plus"}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CallingTeam;