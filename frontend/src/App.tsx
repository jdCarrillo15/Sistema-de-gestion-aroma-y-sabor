import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductosPage from "./pages/admin/ProductsPage";
import UsuariosPage from "./pages/admin/UsuariosPage";
import InventarioPage from "./pages/admin/InventarioPage";
import TurnosPage from "./pages/admin/TurnosPage";
import VentasPage from "./pages/admin/VentasPage";
import CocinaCajaLayout from "./components/cocina/CocinaCajaLayout"; 
import CocinaPage from "./pages/cocina/CocinaPage"; 
import ProtectedRoute from "./components/ProtectedRoute";
import CajaPage from "./pages/caja/CajaPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Panel Admin */}
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
          path="/cocina"
          element={
            <ProtectedRoute allowedRoles={['kitchen', 'caja']}>
              <CocinaCajaLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CocinaPage />} />
        </Route>

        
        <Route
          path="/caja"
          element={
            <ProtectedRoute allowedRoles={['kitchen', 'caja']}>
              <CocinaCajaLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CajaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
