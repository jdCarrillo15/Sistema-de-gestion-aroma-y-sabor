import React, { useState, useEffect } from "react";
import { Calendar, Users, ChevronLeft, ChevronRight, Sun, Moon, X, Check } from "lucide-react";
import { getUsers } from "../../services/admin/userService";
import { getShifts, createShift, updateShift } from "../../services/admin/turnos/TurnosService";
import AlertModal from "../../components/common/AlertModal";
import styles from "../../styles/admin/TurnosPage.module.css";

type ShiftType = "morning" | "afternoon";
type Role = "waiter" | "cash" | "kitchen";

type User = {
  id: string;
  user_name: string;
  email: string;
  role: Role;
  status: string;
  person?: {
    first_name: string;
    last_name: string;
  };
};

type Assignment = {
  userId: string;
  userName: string;
  role: Role;
};

type Shift = {
  id?: string;
  date: string;
  type: ShiftType;
  assignments: Assignment[];
};

const TurnosPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingShifts, setIsLoadingShifts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "warning" as "success" | "error" | "info" | "warning"
  });

  const normalizeState = (status: string): string => {
    if (!status) return "activo";
    const lowerState = status.toLowerCase().trim();
    if (lowerState === "activo" || lowerState === "active") {
      return "activo";
    } else if (lowerState === "inactivo" || lowerState === "inactive") {
      return "inactivo";
    }
    return status.toLowerCase();
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await getUsers();
        const usersData = Array.isArray(response) ? response : response?.users || [];

        const mappedUsers: User[] = usersData
          .filter((u: any) => {
            const role = u.role?.toLowerCase();
            const status = normalizeState(u.status ?? u.state ?? "");
            return role !== "admin" && status === "activo";
          })
          .map((u: any) => ({
            id: u.id,
            user_name: u.user_name,
            email: u.email,
            role: u.role as Role,
            status: normalizeState(u.status ?? u.state ?? ""),
            person: u.person
              ? {
                  first_name: u.person.first_name,
                  last_name: u.person.last_name,
                }
              : undefined,
          }));

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        setAlertConfig({
          title: "Error",
          message: "No se pudieron cargar los usuarios",
          type: "error"
        });
        setIsAlertOpen(true);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setIsLoadingShifts(true);
        const shiftsData = await getShifts();
        const validShifts = Array.isArray(shiftsData) ? shiftsData : [];
        setShifts(validShifts);
      } catch (error) {
        console.error("Error al cargar turnos:", error);
        setAlertConfig({
          title: "Error",
          message: "No se pudieron cargar los turnos",
          type: "error"
        });
        setIsAlertOpen(true);
        setShifts([]); 
      } finally {
        setIsLoadingShifts(false);
      }
    };

    fetchShifts();
  }, [currentDate]); 

  const activeUsers = users;

  const roleLabels: Record<Role, string> = {
    waiter: "Mesero",
    cash: "Cajero",
    kitchen: "Cocina"
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getShiftsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return shifts.filter(s => s.date === dateStr);
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(selected);
    setIsShiftModalOpen(true);
  };

  const handleShiftTypeSelect = (type: ShiftType) => {
    setSelectedShiftType(type);
    const dateStr = formatDate(selectedDate!);
    const existingShift = shifts.find(s => s.date === dateStr && s.type === type);
    
    if (existingShift) {
      setSelectedAssignments([...existingShift.assignments]);
    } else {
      setSelectedAssignments([]);
    }
    
    setIsShiftModalOpen(false);
    setIsAssignmentModalOpen(true);
  };

  const handleToggleAssignment = (user: User, role: Role) => {
    const existingIndex = selectedAssignments.findIndex(a => a.userId === user.id);
    
    if (existingIndex >= 0) {
      setSelectedAssignments(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      const displayName = user.person 
        ? `${user.person.first_name} ${user.person.last_name}` 
        : user.user_name;
      
      setSelectedAssignments(prev => [...prev, {
        userId: user.id,
        userName: displayName,
        role: role
      }]);
    }
  };

  const handleSaveAssignments = async () => {
    if (selectedAssignments.length < 2) {
      setAlertConfig({
        title: "Requisitos no cumplidos",
        message: "Debes asignar al menos 2 usuarios por turno.",
        type: "warning"
      });
      setIsAlertOpen(true);
      return;
    }

    const hasWaiter = selectedAssignments.some(a => a.role === "waiter");
    if (!hasWaiter) {
      setAlertConfig({
        title: "Requisitos no cumplidos",
        message: "Debes asignar al menos un usuario con rol de Mesero.",
        type: "warning"
      });
      setIsAlertOpen(true);
      return;
    }

    const hasCashOrKitchen = selectedAssignments.some(a => a.role === "cash" || a.role === "kitchen");
    if (!hasCashOrKitchen) {
      setAlertConfig({
        title: "Requisitos no cumplidos",
        message: "Debes asignar al menos un usuario con rol de Cajero o Cocina.",
        type: "warning"
      });
      setIsAlertOpen(true);
      return;
    }

    try {
      setIsSaving(true);
      const dateStr = formatDate(selectedDate!);
      
      const existingShift = shifts.find(s => s.date === dateStr && s.type === selectedShiftType);

      const shiftData: Shift = {
        date: dateStr,
        type: selectedShiftType!,
        assignments: selectedAssignments
      };

      if (existingShift && existingShift.id) {
        await updateShift(existingShift.id, shiftData);
      } else {
        await createShift(shiftData);
      }

      const updatedShifts = await getShifts();
      setShifts(updatedShifts);

      setAlertConfig({
        title: "Turno asignado",
        message: "El turno se ha guardado exitosamente.",
        type: "success"
      });
      setIsAlertOpen(true);

      setIsAssignmentModalOpen(false);
      setSelectedDate(null);
      setSelectedShiftType(null);
      setSelectedAssignments([]);

    } catch (error: any) {
      console.error("Error al guardar turno:", error);
      setAlertConfig({
        title: "Error",
        message: error.message || "No se pudo guardar el turno",
        type: "error"
      });
      setIsAlertOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className={`${styles.calendarDay} ${styles.empty}`}></div>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayShifts = getShiftsForDate(date);
    const isToday = new Date().toDateString() === date.toDateString();
    
    days.push(
      <div
        key={day}
        className={`${styles.calendarDay} ${isToday ? styles.today : ''}`}
        onClick={() => handleDateClick(day)}
      >
        <div className={styles.dayNumber}>{day}</div>
        {dayShifts.length > 0 && (
          <div className={styles.dayShifts}>
            {dayShifts.map((shift, idx) => (
              <div key={idx} className={`${styles.shiftIndicator} ${styles[shift.type]}`}>
                <div className={styles.shiftDot}></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.TurnosPage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Asignación de Turnos</h1>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.calendar}`}>
            <Calendar size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{shifts.length}</div>
            <div className={styles.statLabel}>Turnos Asignados</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.morning}`}>
            <Sun size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{shifts.filter(s => s.type === 'morning').length}</div>
            <div className={styles.statLabel}>Turnos Mañana</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.afternoon}`}>
            <Moon size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{shifts.filter(s => s.type === 'afternoon').length}</div>
            <div className={styles.statLabel}>Turnos Tarde</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.users}`}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{activeUsers.length}</div>
            <div className={styles.statLabel}>Usuarios Activos</div>
          </div>
        </div>
      </div>

      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          <h2 className={styles.calendarMonth}>{monthName}</h2>
          <div className={styles.calendarNav}>
            <button className={styles.navButton} onClick={previousMonth}>
              <ChevronLeft size={20} />
            </button>
            <button className={styles.navButton} onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className={styles.calendarWeekdays}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className={styles.weekday}>{day}</div>
          ))}
        </div>

        <div className={styles.calendarGrid}>
          {isLoadingShifts ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
              Cargando turnos...
            </div>
          ) : (
            days
          )}
        </div>
      </div>

      {isShiftModalOpen && selectedDate && (
        <div className={styles.modalOverlay} onClick={() => setIsShiftModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <button className={styles.closeButton} onClick={() => setIsShiftModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.shiftSelection}>
              <div className={styles.shiftOption} onClick={() => handleShiftTypeSelect('morning')}>
                <div className={`${styles.shiftIcon} ${styles.morning}`}>
                  <Sun size={24} />
                </div>
                <div className={styles.shiftInfo}>
                  <h3>Turno Mañana</h3>
                  <p>6:00 AM - 2:00 PM</p>
                </div>
              </div>

              <div className={styles.shiftOption} onClick={() => handleShiftTypeSelect('afternoon')}>
                <div className={`${styles.shiftIcon} ${styles.afternoon}`}>
                  <Moon size={24} />
                </div>
                <div className={styles.shiftInfo}>
                  <h3>Turno Tarde</h3>
                  <p>2:00 PM - 10:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAssignmentModalOpen && selectedDate && selectedShiftType && (
        <div className={styles.modalOverlay} onClick={() => setIsAssignmentModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Asignar Personal</h2>
                <p className={styles.pageSubtitle}>
                  {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} - 
                  {selectedShiftType === 'morning' ? ' Turno Mañana' : ' Turno Tarde'}
                </p>
              </div>
              <button className={styles.closeButton} onClick={() => setIsAssignmentModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.usersList}>
              {isLoadingUsers ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  Cargando usuarios...
                </div>
              ) : activeUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  No hay usuarios activos disponibles
                </div>
              ) : (
                activeUsers.map(user => {
                  const assignment = selectedAssignments.find(a => a.userId === user.id);
                  const isSelected = !!assignment;
                  const displayName = user.person 
                    ? `${user.person.first_name} ${user.person.last_name}` 
                    : user.user_name;
                  
                  return (
                    <div
                      key={user.id}
                      className={`${styles.userItem} ${isSelected ? styles.selected : ''}`}
                      onClick={() => !isSelected && handleToggleAssignment(user, user.role)}
                    >
                      <div className={styles.userCheckbox}>
                        {isSelected && <Check size={16} color="white" />}
                      </div>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{displayName}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                      </div>
                      {isSelected && (
                        <select
                          className={styles.roleSelect}
                          value={assignment.role}
                          onChange={(e) => {
                            const newAssignments = selectedAssignments.map(a =>
                              a.userId === user.id ? { ...a, role: e.target.value as Role } : a
                            );
                            setSelectedAssignments(newAssignments);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className={styles.modalActions}>
              <button 
                className={`${styles.button} ${styles.buttonSecondary}`} 
                onClick={() => setIsAssignmentModalOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button 
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={handleSaveAssignments}
                disabled={selectedAssignments.length === 0 || isSaving}
              >
                <Check size={20} />
                {isSaving ? 'Guardando...' : `Guardar Asignación (${selectedAssignments.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttonText="Entendido"
      />
    </div>
  );
};

export default TurnosPage;