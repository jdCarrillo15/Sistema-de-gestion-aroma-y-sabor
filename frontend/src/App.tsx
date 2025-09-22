import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import ProductosPage from "./pages/ProductosPage";
import UsuariosPage from "./pages/UsuariosPage";
import InventarioPage from "./pages/InventarioPage";
import TurnosPage from "./pages/TurnosPage";
import VentasPage from "./pages/VentasPage";

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
