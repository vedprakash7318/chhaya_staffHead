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
import 'react-toastify/dist/ReactToastify.css';  
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import '../CSS/CallingTeam.css'

const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

const CallingTeam = () => {
  const [team, setTeam] = useState([]);
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  // Fetch all members
  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/calling-team/all');
      setTeam(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle add or update
  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/calling-team/update/${editingId}`, form);
        toast.success('Updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/calling-team/add', form);
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
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/calling-team/delete/${id}`);
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
      `
    });
  };

  // Action buttons
  const actionBody = (row) => (
    <div className="flex gap-2">
      <Button icon="pi pi-eye" className="p-button-info p-button-rounded p-button-sm" onClick={() => handleView(row)} />
      <Button icon="pi pi-pencil" className="p-button-warning p-button-rounded p-button-sm" onClick={() => handleEdit(row)} />
      <Button icon="pi pi-trash" className="p-button-danger p-button-rounded p-button-sm" onClick={() => handleDelete(row._id)} />
    </div>
  );

  return (
    <div>
      <ToastContainer />
      <div className="calling-header">
        <h2 className="">Calling Team</h2>
        <Button label="Add Member" icon="pi pi-plus" onClick={() => { resetForm(); setVisible(true); }} />
      </div>

      <DataTable
        value={team}
        paginator rows={10}
        rowsPerPageOptions={[5,10,20]}
        responsiveLayout="scroll"
        stripedRows
        className='dataTable-calling'
      >
        <Column field="name" header="Name" />
        <Column field="phone" header="Phone" />
        <Column field="gender" header="Gender" />
        <Column field="email" header="Email" />
        <Column field="password" header="Password" />
        <Column field="city" header="City" />
        <Column header="Actions" body={actionBody} style={{ textAlign: 'center', width: '8rem' }} />
      </DataTable>

      <Dialog
        header={editingId ? 'Edit Member' : 'Add Member'}
        visible={visible}
        style={{ width: '30vw' }}
        onHide={() => setVisible(false)}
      >
        <div className="flex flex-col gap-3">
          <InputText name="name" placeholder="Name" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
          <InputText name="phone" placeholder="Phone" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} />
          <InputText name="email" placeholder="Email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} />
          <InputText name="password" placeholder="Password" value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} />
          <Dropdown
            value={form.gender}
            options={genderOptions}
            onChange={e => setForm(prev => ({ ...prev, gender: e.value }))}
            placeholder="Select Gender"
          />
          <InputText name="city" placeholder="City" value={form.city} onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))} />
          <Button label={editingId ? 'Update' : 'Submit'} onClick={handleSubmit} />
        </div>
      </Dialog>
    </div>
  );
};

export default CallingTeam;
