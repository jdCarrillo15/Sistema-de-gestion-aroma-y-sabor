import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/CreateUserModal.css"; // Puedes usar el mismo estilo

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Mejor si importas el tipo User
  onSubmit: (updatedUser: any) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmit,
}) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Cliente");
  const [state, setState] = useState("Activo");

  // Datos de persona
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [documentId, setDocumentId] = useState("");

  // Estado para controlar la alerta de confirmación
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setUserName(user.user_name ?? "");
      setEmail(user.email ?? "");
      setRole(user.role ?? "Cliente");
      setState(user.state ?? "Activo");

      setFirstName(user.person?.first_name ?? "");
      setLastName(user.person?.last_name ?? "");
      setBirthdate(user.person?.birthdate ?? "");
      setDocumentId(user.person?.document_id ?? "");

      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const confirmUpdate = () => {
    const updatedUser = {
      ...user, // conserva id y demás propiedades no editadas
      user_name: userName,
      email,
      role,
      state,
      person: {
        ...user.person, // conserva otros posibles campos
        first_name: firstName,
        last_name: lastName,
        birthdate,
        document_id: documentId,
      },
    };

    onSubmit(updatedUser);
    setIsConfirmOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <h2>Editar Usuario</h2>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="userName">Nombre de usuario</label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Rol</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Cocinero">Cocinero</option>
                <option value="Mesero">Mesero</option>
                <option value="Cliente">Cliente</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="state">Estado</label>
              <select
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <h3>Datos de persona</h3>
            <div className="form-group">
              <label htmlFor="firstName">Nombre</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Apellido</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="birthdate">Fecha de nacimiento</label>
              <input
                type="date"
                id="birthdate"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="documentId">Documento</label>
              <input
                type="text"
                id="documentId"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
              />
            </div>

            <div className="modal-buttons">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Guardar cambios
              </Button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmar modificación"
        message="¿Estás seguro de que deseas guardar los cambios de este usuario?"
        onConfirm={confirmUpdate}
        confirmText="Sí, guardar"
        cancelText="Cancelar"
      />
    </>
  );
};

export default EditUserModal;
