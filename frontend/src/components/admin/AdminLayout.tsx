import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../../styles/admin/AdminLayout.css";
import AdminMobileNav from "./AdminMobileNav";

const AdminLayout: React.FC = () => {
  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <Topbar />
        <main className="admin-content">
          <Outlet />
        </main>
        <AdminMobileNav />
      </div>
    </div>
  );
};

export default AdminLayout;
