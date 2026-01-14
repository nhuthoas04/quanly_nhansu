import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/Auth/Login';

// Dashboard
import Dashboard from './pages/Dashboard/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

// Employee Self-Service Pages
import AttendanceHistory from './pages/Employee/AttendanceHistory';
import Profile from './pages/Employee/Profile';
import MyLeaveRequests from './pages/Employee/MyLeaveRequests';
import MyLeaveRequestForm from './pages/Employee/MyLeaveRequestForm';
import MyLeaveRequestEdit from './pages/Employee/MyLeaveRequestEdit';

// Employee Pages
import EmployeeList from './pages/Employees/EmployeeList';
import EmployeeDetail from './pages/Employees/EmployeeDetail';
import EmployeeForm from './pages/Employees/EmployeeForm';

// Department Pages
import DepartmentList from './pages/Departments/DepartmentList';
import DepartmentDetail from './pages/Departments/DepartmentDetail';
import DepartmentForm from './pages/Departments/DepartmentForm';

// Position Pages
import PositionList from './pages/Positions/PositionList';
import PositionForm from './pages/Positions/PositionForm';

// Attendance Pages
import AttendanceList from './pages/Attendance/AttendanceList';
import AttendanceForm from './pages/Attendance/AttendanceForm';

// Leave Pages
import LeaveList from './pages/Leaves/LeaveList';
import LeaveForm from './pages/Leaves/LeaveForm';

// Salary Pages
import SalaryList from './pages/Salaries/SalaryList';
import SalaryForm from './pages/Salaries/SalaryForm';

// Contract Pages
import ContractList from './pages/Contracts/ContractList';
import ContractForm from './pages/Contracts/ContractForm';

// User Management (Admin only)
import UserList from './pages/Users/UserList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="my-attendance" element={<EmployeeDashboard />} />
              <Route path="my-history" element={<AttendanceHistory />} />
              <Route path="my-leaves" element={<MyLeaveRequests />} />
              <Route path="my-leaves/new" element={<MyLeaveRequestForm />} />
              <Route path="my-leaves/:id/edit" element={<MyLeaveRequestEdit />} />
              <Route path="profile" element={<Profile />} />

              {/* Users (Admin only) */}
              <Route path="users" element={<UserList />} />

              {/* Employees */}
              <Route path="employees" element={<EmployeeList />} />
              <Route path="employees/new" element={<EmployeeForm />} />
              <Route path="employees/:id" element={<EmployeeDetail />} />
              <Route path="employees/:id/edit" element={<EmployeeForm />} />

              {/* Departments */}
              <Route path="departments" element={<DepartmentList />} />
              <Route path="departments/new" element={<DepartmentForm />} />
              <Route path="departments/:id" element={<DepartmentDetail />} />
              <Route path="departments/:id/edit" element={<DepartmentForm />} />

              {/* Positions */}
              <Route path="positions" element={<PositionList />} />
              <Route path="positions/new" element={<PositionForm />} />
              <Route path="positions/:id/edit" element={<PositionForm />} />

              {/* Attendance */}
              <Route path="attendance" element={<AttendanceList />} />
              <Route path="attendance/new" element={<AttendanceForm />} />
              <Route path="attendance/:id" element={<AttendanceForm />} />
              <Route path="attendance/:id/edit" element={<AttendanceForm />} />

              {/* Leaves */}
              <Route path="leaves" element={<LeaveList />} />
              <Route path="leaves/new" element={<LeaveForm />} />
              <Route path="leaves/:id" element={<LeaveForm />} />

              {/* Salaries */}
              <Route path="salaries" element={<SalaryList />} />
              <Route path="salaries/new" element={<SalaryForm />} />
              <Route path="salaries/:id" element={<SalaryForm />} />
              <Route path="salaries/:id/edit" element={<SalaryForm />} />

              {/* Contracts */}
              <Route path="contracts" element={<ContractList />} />
              <Route path="contracts/new" element={<ContractForm />} />
              <Route path="contracts/:id" element={<ContractForm />} />
              <Route path="contracts/:id/edit" element={<ContractForm />} />
            </Route>
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
