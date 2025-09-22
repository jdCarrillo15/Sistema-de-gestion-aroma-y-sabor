import React from "react";
import { Plus, Edit3, Trash2, Eye } from "lucide-react";
import "../styles/ProductosPage.css";

type Product = {
  id: number;
  name: string;
  price: string;
  stock: number;
  status: string;
};

const sampleProducts: Product[] = [
  { id: 1, name: "Café Espresso", price: "$2.50", stock: 30, status: "Activo" },
  { id: 2, name: "Latte", price: "$3.80", stock: 22, status: "Activo" },
  { id: 3, name: "Bagel", price: "$1.50", stock: 5, status: "Bajo Stock" },
];

const ProductosPage: React.FC = () => {
  return (
    <div className="productos-page space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
        <button className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-600">
              <th>Producto</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sampleProducts.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-3 font-medium">{p.name}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>
                <td>
                  {p.status === "Activo" ? (
                    <span className="status activo">{p.status}</span>
                  ) : (
                    <span className="status bajo-stock">{p.status}</span>
                  )}
                </td>
                <td className="text-right">
                  <button title="Ver" className="mr-2"><Eye className="w-4 h-4" /></button>
                  <button title="Editar" className="mr-2"><Edit3 className="w-4 h-4" /></button>
                  <button title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductosPage;
