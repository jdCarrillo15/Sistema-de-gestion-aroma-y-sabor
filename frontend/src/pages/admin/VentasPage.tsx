import React from "react";
import { DollarSign } from "lucide-react";
import "../../styles/admin/products/RecentProducts.css";

type Sale = {
  id: number;
  date: string;
  total: string;
  cashier: string;
};

const sampleSales: Sale[] = [
  { id: 1, date: "2025-09-20 10:15", total: "$24.50", cashier: "Ana" },
  { id: 2, date: "2025-09-20 11:40", total: "$12.00", cashier: "Juan" },
];

const VentasPage: React.FC = () => {
  const totalToday = "$1,248"; 

  return (
    <div className="ventas-page space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold">Ventas por Turnos</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total hoy</p>
          <p className="text-lg font-bold">{totalToday}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <table className="w-full">
          <thead className="text-sm text-gray-600">
            <tr>
              <th>Fecha</th>
              <th>Cajero</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {sampleSales.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="py-3">{s.date}</td>
                <td>{s.cashier}</td>
                <td>{s.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VentasPage;
