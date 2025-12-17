
import React from 'react';
import AdminDashboardComponent from '../components/AdminDashboard';
import { useAuth } from '../context/AuthContext';

const AdminDashboard: React.FC = () => {
    // Add additional page-level logic here if needed
    return <AdminDashboardComponent />;
};

export default AdminDashboard;
