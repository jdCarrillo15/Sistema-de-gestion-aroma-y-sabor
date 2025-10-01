import React from "react";
import { Clock, Plus } from "lucide-react";

type Shift = {
  id: number;
  employee: string;
  date: string;
  time: string;
  role: string;
};

const sampleShifts: Shift[] = [
  { id: 1, employee: "Juan Pérez", date: "2025-09-20", time: "08:00 - 14:00", role: "Barista" },
  { id: 2, employee: "Ana López", date: "2025-09-20", time: "14:00 - 20:00", role: "Cajera" },
];

const TurnosPage: React.FC = () => {
  return (
    <div className="turnos-page space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold">Asignación de Turnos</h1>
        </div>
        <button className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-400 to-indigo-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Turno
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <ul className="space-y-3">
          {sampleShifts.map((s) => (
            <li key={s.id} className="flex justify-between items-center border p-3 rounded-md">
              <div>
                <p className="font-medium">{s.employee} — <span className="text-sm text-gray-600">{s.role}</span></p>
                <p className="text-sm text-gray-600">{s.date} · {s.time}</p>
              </div>
              <div className="acciones">
                <span>Editar</span>
                <span>Eliminar</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TurnosPage;
