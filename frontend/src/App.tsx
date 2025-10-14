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
import CajaPage from "./pages/caja/CajaPage";
import MeseroLayout from "./components/mesero/MeseroLayout";
import MesasPage from "./pages/mesero/MesasPage";
import CocinaPage from "./pages/cocina/CocinaPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { SocketProvider } from "./context/socketContext";
import { UserProvider } from "./context/userContext";

function App() {
  return (
    <UserProvider>
      <SocketProvider>
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
              path="/mesero"
              element={
                <ProtectedRoute allowedRoles={['waiter']}>
                  <MeseroLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<MesasPage />} />
            </Route>

            <Route
              path="/cocina"
              element={
                <ProtectedRoute allowedRoles={['kitchen', 'cash']}>
                  <CocinaCajaLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CocinaPage />} />
            </Route>


            <Route
              path="/caja"
              element={
                <ProtectedRoute allowedRoles={['kitchen', 'cash']}>
                  <CocinaCajaLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CajaPage />} />
            </Route>
          </Routes>
        </BrowserRouter >
      </SocketProvider>
    </UserProvider >
  );
}

export default App;
