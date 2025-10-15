import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Login from './Pages/StaffHead/Login';
import Dashboard from './Pages/StaffHead/Dashboard'
import CallingTeam from './Pages/StaffHead/CallingTeam';
import Leads from './Pages/StaffHead/Leads'
import ReviewForm from './Pages/StaffHead/ReviewForms';
import ReviewFormFull from './Pages/StaffHead/ReviewFomFull';
import Mainpage from './Pages/StaffHead/Mainpage'

import JobPage from './Pages/StaffHead/JobPage';
function App() {
  return (
    <>
      <Router>
         <Routes>
        <Route path='/' element={<Login/>}/>

        <Route path="/dashboard" element={
          <Dashboard>
            <Mainpage />
          </Dashboard>
        } />


      <Route path="/calling-team" element={
          <Dashboard>
            <CallingTeam />
          </Dashboard>
        } />

  
      <Route path="/job" element={
          <Dashboard>
            <JobPage />
          </Dashboard>
        } />

      <Route path="/view-leads" element={
          <Dashboard>
            <Leads />
          </Dashboard>
        } />


      <Route path="/ReviewForm" element={
          <Dashboard>
            <ReviewForm />
          </Dashboard>
        } />

      <Route path="ReviewForm/ReviewFormFull" element={
          <Dashboard>
            <ReviewFormFull />
          </Dashboard>
        } />


         </Routes>
    </Router>

    </>
  )
}

export default App
