import React from "react";
import { Package } from "lucide-react";
import "../../styles/admin/InventarioPage.css";

type Item = {
  id: number;
  name: string;
  qty: number;
  minQty: number;
};

const inventory: Item[] = [
  { id: 1, name: "Café en grano (kg)", qty: 12, minQty: 5 },
  { id: 2, name: "Leche (L)", qty: 8, minQty: 10 },
  { id: 3, name: "Azúcar (kg)", qty: 3, minQty: 2 },
];

const InventarioPage: React.FC = () => {
  return (
    <div className="inventario-page space-y-6">
      <div className="flex items-center space-x-3">
        <Package className="w-6 h-6 text-gray-700" />
        <h1 className="text-2xl font-bold">Inventario</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <table className="w-full">
          <thead className="text-sm text-gray-600">
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Mínimo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="py-3">{it.name}</td>
                <td>{it.qty}</td>
                <td>{it.minQty}</td>
                <td>
                  {it.qty <= it.minQty ? (
                    <span className="status reabastecer">Reabastecer</span>
                  ) : (
                    <span className="status ok">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventarioPage;
