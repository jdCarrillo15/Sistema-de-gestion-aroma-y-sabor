import React, { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Eye, Users, UserCheck, UserX, Activity } from "lucide-react";
import Button from "../../components/common/Button";
import CreateUserModal from "../../components/admin/users/CreateUserModal";
import EditUserModal from "../../components/admin/users/EditUserModal";
import ConfirmModal from "../../components/admin/ConfirmModal";
import AlertModal from "../../components/common/AlertModal";
import ViewUserModal from "../../components/admin/users/ViewUserModal";
import { getUsers, createUser, updateUser, hardDeleteUser } from "../../services/admin/userService";
import styles from "../../styles/admin/users/UsuariosPage.module.css";

export type User = {
  id: string;
  user_name: string;
  email: string;
  role: string;
  status: string;
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
  const [isLoading, setIsLoading] = useState(false);

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const normalizeState = (status: string): string => {
    if (!status) return "Activo";

    const lowerState = status.toLowerCase().trim();

    if (lowerState === "activo" || lowerState === "active") {
      return "Activo";
    } else if (lowerState === "inactivo" || lowerState === "inactive") {
      return "Inactivo";
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Cargar usuarios del backend
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers();
      const usersData = Array.isArray(response) ? response : response?.users || [];

      const mappedUsers: User[] = usersData.map((u: any) => ({
        id: u.id,
        user_name: u.user_name,
        email: u.email,
        role: u.role,
        status: normalizeState(u.status ?? u.state ?? ""),
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

      const uniqueUsers = Array.from(new Map(mappedUsers.map((u) => [u.id, u])).values());
      setUsers(uniqueUsers);

    } catch (error: any) {
      console.error("Error cargando usuarios:", error);
      setAlertMessage(error.message || "Error al cargar los usuarios");
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (userData: any) => {
    try {
      setIsLoading(true);

      if (!userData.email || !userData.user_name) {
        throw new Error("Faltan campos obligatorios");
      }

      // Mapear los datos para el backend
      const userPayload = {
        user_name: userData.user_name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        status: userData.status,
        first_name: userData.first_name,
        last_name: userData.last_name,
        birthdate: userData.birthdate,
        document_id: userData.document_id,
      };

      // Llamar al servicio del backend
      await createUser(userPayload);

      // Recargar la lista de usuarios
      await loadUsers();
      setIsModalOpen(false);

      // Mostrar mensaje de éxito
      setAlertMessage("Usuario creado exitosamente");
      setIsAlertOpen(true);

    } catch (error: any) {
      console.error("Error creando usuario:", error);
      setAlertMessage(error.message || "No fue posible crear el usuario");
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (updatedUser: User) => {
    try {
      setIsLoading(true);

      if (!updatedUser.user_name || !updatedUser.email) {
        throw new Error("Faltan campos obligatorios al editar");
      }

      // Preparar datos para la actualización
      const updatePayload: any = {
        user_name: updatedUser.user_name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      };

      // Si hay datos de persona, incluirlos
      if (updatedUser.person) {
        updatePayload.first_name = updatedUser.person.first_name;
        updatePayload.last_name = updatedUser.person.last_name;
        updatePayload.birthdate = updatedUser.person.birthdate;
        updatePayload.document_id = updatedUser.person.document_id;
      }

      // Llamar al servicio del backend
      await updateUser(updatedUser.id, updatePayload);

      // Recargar la lista de usuarios
      await loadUsers();
      setIsEditModalOpen(false);
      setSelectedUser(null);

      // Mostrar mensaje de éxito
      setAlertMessage("Usuario actualizado exitosamente");
      setIsAlertOpen(true);

    } catch (error: any) {
      console.error("Error editando usuario:", error);
      setAlertMessage(error.message || "No fue posible editar el usuario");
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
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

  const handleDeleteUser = async (id: string) => {
    try {
      setIsLoading(true);

      // Llamar al servicio del backend
      await hardDeleteUser(id);

      // Recargar la lista de usuarios
      await loadUsers();
      setIsConfirmOpen(false);
      setUserToDelete(null);

      // Mostrar mensaje de éxito
      setAlertMessage("Usuario eliminado exitosamente");
      setIsAlertOpen(true);

    } catch (error: any) {
      console.error("Error eliminando usuario:", error);
      setAlertMessage(error.message || "No fue posible eliminar el usuario");
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete !== null) {
      handleDeleteUser(userToDelete);
    }
  };

  // Calcular estadísticas
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status.toLowerCase() === "activo").length;
  const inactiveUsers = users.filter(u => u.status.toLowerCase() === "inactivo").length;
  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className={styles.usuariosPage}>
      <div className={styles.usuariosHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Gestión de Usuarios</h1>
        </div>
        <div className={styles.contenedorBoton}>
          <Button
            className={styles.btnNuevoUsuario}
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading}
          >
            <Plus className={styles.icono} />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <div className={`${styles.statIcon} ${styles.usuarios}`}>
              <Users size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{totalUsers}</div>
              <div className={styles.statLabel}>Usuarios Totales</div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <div className={`${styles.statIcon} ${styles.activos}`}>
              <UserCheck size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{activeUsers}</div>
              <div className={styles.statLabel}>Usuarios Activos</div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <div className={`${styles.statIcon} ${styles.inactivos}`}>
              <UserX size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{inactiveUsers}</div>
              <div className={styles.statLabel}>Usuarios Inactivos</div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <div className={`${styles.statIcon} ${styles.roles}`}>
              <Activity size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{Object.keys(roleStats).length}</div>
              <div className={styles.statLabel}>Roles Diferentes</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.usuariosTablaContainer}>
        {isLoading && users.length === 0 && (
          <div className={styles.loadingState}>
            <Users size={48} className={styles.loadingIcon} />
            <p>Cargando usuarios...</p>
          </div>
        )}

        {!isLoading && users.length === 0 && (
          <div className={styles.emptyState}>
            <Users size={48} className={styles.emptyIcon} />
            <h3>No hay usuarios</h3>
            <p>Crea tu primer usuario para comenzar</p>
          </div>
        )}

        {users.length > 0 && (
          <table className={styles.usuariosTabla}>
            <thead>
              <tr>
                <th>Nombre de usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha de inicio</th>
                <th className={styles.accionesCol}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className={styles.nombre}>{u.user_name}</td>
                  <td>{u.email}</td>
                  <td className={styles.role}>{u.role}</td>
                  <td>
                    <span
                      className={`${styles.estado} ${u.status.toLowerCase() === "activo" ? styles.activo : styles.inactivo}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString("es-ES")}</td>
                  <td className={styles.productActions}>
                    <Button
                      type="button"
                      variant="secondary"
                      className={`${styles.btnIcon} ${styles.ver}`}
                      onClick={() => openViewModal(u)}
                      disabled={isLoading}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className={`${styles.btnIcon} ${styles.editar}`}
                      onClick={() => openEditModal(u)}
                      disabled={isLoading}
                    >
                      <Edit3 size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className={`${styles.btnIcon} ${styles.eliminar}`}
                      onClick={() => handleDeleteClick(u.id)}
                      disabled={isLoading}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Vista de Cards para Móvil */}
        {users.length > 0 && (
          <div className={styles.usuariosCards}>
            {users.map((u) => (
              <div key={u.id} className={styles.userCard}>
                <div className={styles.userCardHeader}>
                  <div className={styles.userCardInfo}>
                    <div className={styles.userCardName}>{u.user_name}</div>
                    <div className={styles.userCardEmail}>{u.email}</div>
                  </div>
                  <span
                    className={`${styles.estado} ${u.status.toLowerCase() === "activo" ? styles.activo : styles.inactivo}`}
                  >
                    {u.status}
                  </span>
                </div>

                <div className={styles.userCardDetails}>
                  <div className={styles.userCardDetail}>
                    <span className={styles.userCardLabel}>Rol</span>
                    <span className={styles.userCardValue}>{u.role}</span>
                  </div>
                  <div className={styles.userCardDetail}>
                    <span className={styles.userCardLabel}>Fecha de inicio</span>
                    <span className={styles.userCardValue}>
                      {new Date(u.created_at).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>

                <div className={styles.userCardActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    className={`${styles.btnIcon} ${styles.ver}`}
                    onClick={() => openViewModal(u)}
                    disabled={isLoading}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className={`${styles.btnIcon} ${styles.editar}`}
                    onClick={() => openEditModal(u)}
                    disabled={isLoading}
                  >
                    <Edit3 size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className={`${styles.btnIcon} ${styles.eliminar}`}
                    onClick={() => handleDeleteClick(u.id)}
                    disabled={isLoading}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
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
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción eliminará el usuario de Firebase Auth y todos sus datos relacionados."
        onConfirm={handleConfirmDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal para ver usuario */}
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
        title={alertMessage.includes("exitosamente") ? "Éxito" : "Error"}
        message={alertMessage}
        type={alertMessage.includes("exitosamente") ? "success" : "error"}
        buttonText="Cerrar"
      />
    </div>
  );
};

export default UsuariosPage;