import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductosPage from "./pages/admin/ProductsPage";
import UsuariosPage from "./pages/admin/UsuariosPage";
import InventarioPage from "./pages/admin/InventarioPage";
import TurnosPage from "./pages/admin/TurnosPage";
import VentasPage from "./pages/admin/VentasPage";
import MeseroLayout from "./components/mesero/MeseroLayout";
import MesasPage from "./pages/mesero/MesasPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="productos" element={<ProductosPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="inventario" element={<InventarioPage />} />
          <Route path="turnos" element={<TurnosPage />} />
          <Route path="ventas" element={<VentasPage />} />
        </Route>

        <Route
          path="/mesero"
          element={
            <ProtectedRoute allowedRoles={['waiter']}>
              <MeseroLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MesasPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;