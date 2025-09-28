import React, { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Eye } from "lucide-react";
import Button from "../../components/common/Button";
import CreateUserModal from "../../components/admin/CreateUserModal";
import EditUserModal from "../../components/admin/EditUserModal";
import ConfirmModal from "../../components/admin/ConfirmModal";
import AlertModal from "../../components/common/AlertModal";
import ViewUserModal from "../../components/admin/ViewUserModal";
import "../../styles/admin/UsuariosPage.css";
import { getUsers } from "../../services/admin/userService";
import { updateUser } from "../../services/admin/userService";

export type User = {
  id: string;
  user_name: string;
  email: string;
  role: string;
  state: string;
  created_at: string;
  person?: {
    id?: string;
    first_name: string;
    last_name: string;
    birthdate: string;
    document_id: string;
  };
};

const UsuariosPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const normalizeState = (state: string): string => {
    if (!state) return "Activo";

    const lowerState = state.toLowerCase().trim();

    if (lowerState === "activo" || lowerState === "active") {
      return "Activo";
    } else if (lowerState === "inactivo" || lowerState === "inactive") {
      return "Inactivo";
    }
    return state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
  };

  const getAllUsers = async () => {
    try {
      const res = await getUsers();
      const incoming = Array.isArray(res) ? res : res?.users;

      if (!Array.isArray(incoming)) {
        throw new Error("Respuesta inválida de getUsers");
      }

      const mapped: User[] = incoming.map((u: any) => ({
        id: u.id,
        user_name: u.user_name,
        email: u.email,
        role: u.role,
        state: normalizeState(u.state ?? ""),
        created_at: u.created_at ?? new Date().toISOString(),
        person: u.person
          ? {
            id: u.person.id,
            first_name: u.person.first_name,
            last_name: u.person.last_name,
            birthdate: u.person.birthdate,
            document_id: u.person.document_id,
          }
          : undefined,
      }));

      const unique = Array.from(new Map(mapped.map((u) => [u.id, u])).values());

      setUsers(unique);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      setAlertMessage("No fue posible obtener los usuarios");
      setIsAlertOpen(true);
    }
  };

  const handleAddUser = (user: any) => {
    const newUser: User = {
      id: String(Date.now()),
      user_name: user.user_name,
      email: user.email,
      role: user.role,
      state: normalizeState(user.state),
      created_at: new Date().toISOString(),
      person: {
        first_name: user.first_name,
        last_name: user.last_name,
        birthdate: user.birthdate,
        document_id: user.document_id,
      },
    };

    try {
      if (!user.email || !user.user_name) {
        throw new Error("Faltan campos obligatorios");
      }

      const newUser: User = {
        id: String(Date.now()),
        user_name: user.user_name,
        email: user.email,
        role: user.role,
        state: normalizeState(user.state),
        created_at: new Date().toISOString(),
        person: {
          first_name: user.first_name,
          last_name: user.last_name,
          birthdate: user.birthdate,
          document_id: user.document_id,
        },
      };

      setUsers((prev) => [...prev, newUser]);
      setIsModalOpen(false);
    } catch (err: any) {
      setAlertMessage(err.message || "No fue posible crear el usuario");
      setIsAlertOpen(true);
    }
  };


  const handleEditUser = async (updatedUser: User) => {
    try {
      const data = await updateUser(updatedUser.id, updatedUser); 
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? { ...u, ...data } : u))
      );
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setAlertMessage(err.message || "No fue posible editar el usuario");
      setIsAlertOpen(true);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  // Eliminar usuario (solo front)
  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    setIsConfirmOpen(false);
  };

  // Abrir modal de confirmación
  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setIsConfirmOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = () => {
    if (userToDelete !== null) {
      handleDeleteUser(userToDelete);
      setUserToDelete(null);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <h1>Gestión de Usuarios</h1>
        <Button className="btn-nuevo" onClick={() => setIsModalOpen(true)}>
          <Plus className="icono" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="usuarios-tabla-container">
        <table className="usuarios-tabla">
          <thead>
            <tr>
              <th>Nombre de usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha de inicio</th>
              <th className="acciones-col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="nombre">{u.user_name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span
                    className={`estado ${u.state.toLowerCase() === "activo" ? "activo" : "inactivo"
                      }`}
                  >
                    {u.state}
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString("es-ES")}</td>
                <td className="acciones">
                  <Button
                    type="button"
                    variant="secondary"
                    className="btn-icon ver"
                    onClick={() => openViewModal(u)}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="btn-icon editar"
                    onClick={() => openEditModal(u)}
                  >
                    <Edit3 size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="btn-icon eliminar"
                    onClick={() => handleDeleteClick(u.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para crear usuario */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddUser}
      />

      {/* Modal para editar usuario */}
      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          user={selectedUser}
          onSubmit={handleEditUser}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este usuario?"
        onConfirm={handleConfirmDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {selectedUser && (
        <ViewUserModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          user={selectedUser}
        />
      )}

      {/* Modal de alerta para errores */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Error"
        message={alertMessage}
        type="error"
        buttonText="Cerrar"
      />
    </div>
  );
};

export default UsuariosPage;