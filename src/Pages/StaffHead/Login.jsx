import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import '../CSS/Login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/staff-heads/login', form);      
      if (response.data?.user) {
        toast.success('Login successful!');
        const StaffHeadId=response.data.user.id
        // Optional: Store user info (not token)
        localStorage.setItem('staffHeadID',StaffHeadId);

        setTimeout(() => navigate('/calling-team'), 2000);
      } else {
        toast.error('Invalid login response');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-login-container">
      <div className="staff-login-card">
        <h2>Staff Head Login</h2>
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="p-field">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="p-field" style={{ marginTop: '1rem' }}>
            <label htmlFor="password">Password</label>
            <Password
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              feedback={false}
              toggleMask
              placeholder="Enter your password"
              required
            />
          </div>

          <Button
            label={loading ? 'Logging in...' : 'Login'}
            icon="pi pi-sign-in"
            className="p-button-primary"
            loading={loading}
            type="submit"
            style={{ marginTop: '2rem', width: '100%' }}
          />
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={2000} theme="colored" />
    </div>
  );
};

export default Login;
