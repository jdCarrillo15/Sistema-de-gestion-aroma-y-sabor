import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductosPage from "./pages/admin/ProductosPage";
import UsuariosPage from "./pages/admin/UsuariosPage";
import InventarioPage from "./pages/admin/InventarioPage";
import TurnosPage from "./pages/admin/TurnosPage";
import VentasPage from "./pages/admin/VentasPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="productos" element={<ProductosPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="inventario" element={<InventarioPage />} />
          <Route path="turnos" element={<TurnosPage />} />
          <Route path="ventas" element={<VentasPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
