import React, { useState } from "react";
import { Calendar, Users, ChevronLeft, ChevronRight, Sun, Moon, X, Check } from "lucide-react";
import styles from "../../styles/admin/TurnosPage.module.css";

type ShiftType = "morning" | "afternoon";
type Role = "waiter" | "admin" | "cash" | "kitchen";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "inactive";
};

type Assignment = {
  userId: string;
  userName: string;
  role: Role;
};

type Shift = {
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

  const users: User[] = [
    { id: "1", name: "Diego", email: "diego@mesero.com", role: "waiter", status: "active" },
    { id: "2", name: "Carol", email: "prueba@gmail.com", role: "admin", status: "inactive" },
    { id: "3", name: "DiegoCaja", email: "diego@caja.com", role: "cash", status: "active" },
    { id: "4", name: "BrayanMesero", email: "brayan.cifuentes@uptc.edu.co", role: "waiter", status: "active" },
    { id: "5", name: "Carrillo", email: "juandavidcarrilloparra46@gmai.com", role: "admin", status: "active" },
  ];

  const activeUsers = users.filter(u => u.status === "active");

  const roleLabels: Record<Role, string> = {
    waiter: "Mesero",
    admin: "Administrador",
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
      setSelectedAssignments(prev => [...prev, {
        userId: user.id,
        userName: user.name,
        role: role
      }]);
    }
  };

  const handleSaveAssignments = () => {
    const dateStr = formatDate(selectedDate!);
    const newShift: Shift = {
      date: dateStr,
      type: selectedShiftType!,
      assignments: selectedAssignments
    };

    setShifts(prev => {
      const filtered = prev.filter(s => !(s.date === dateStr && s.type === selectedShiftType));
      return [...filtered, newShift];
    });

    setIsAssignmentModalOpen(false);
    setSelectedDate(null);
    setSelectedShiftType(null);
    setSelectedAssignments([]);
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
        <p className={styles.pageSubtitle}>Gestiona los turnos de trabajo de tu equipo</p>
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
          {days}
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
              {activeUsers.map(user => {
                const assignment = selectedAssignments.find(a => a.userId === user.id);
                const isSelected = !!assignment;
                
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
                      <div className={styles.userName}>{user.name}</div>
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
              })}
            </div>

            <div className={styles.modalActions}>
              <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => setIsAssignmentModalOpen(false)}>
                Cancelar
              </button>
              <button 
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={handleSaveAssignments}
                disabled={selectedAssignments.length === 0}
              >
                <Check size={20} />
                Guardar Asignación ({selectedAssignments.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurnosPage;
