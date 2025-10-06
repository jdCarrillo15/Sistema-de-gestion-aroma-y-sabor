import { admin, db } from "../config/firebase.js";
import { getResourceDoc } from "../services/resourceService.js";

export async function getBills(req, res) {
  try {
    const bill = await db.collection("bills").get();

    if (bill.empty) {
      return res.json({ bills: [] });
    }

    const bills = await Promise.all(
      bill.docs.map(async (doc) => {
        const data = doc.data();
        let user = null;

        const userDoc = await getResourceDoc(data.user_id, "users");

        if (userDoc.exists) {
          user = { id: userDoc.id, ...userDoc.data() };
        } else {
          user = null;
        }

        return {
          state: data.state,
          total: data.total,
          table: data.table,
          created_at: data.created_at,
          user,
          products: data.products,
          id: doc.id,
        };
      })
    );

    res.json({ bills });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error obteniendo productos", details: err.message });
  }
}

//CRUD functions
export async function createBill(req, res) {
  const data = req.body;
  if (!data.table || !data.products || data.user_id == null) {
    return res.status(406).json({
      error:
        "Debe tener una mesa, un usuario y al menos un producto para crear una cuenta.",
    });
  }
  

  try {
    // 1. Crear documento en "products"
    await db.collection("bills").add({
      state: data.state,
      total: data.total,
      table: data.table,
      user_id: data.user_id,
      products: data.products,
      id: data.id,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: "Producto creado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al crear el producto",
      details: error.message,
    });
  }
}

export async function getBillById(req, res) {
  try {
    const { id } = req.params;
    const billDoc = await getResourceDoc(id, "bills");
    let user = null;

    if (!billDoc)
      return res.status(404).json({ error: "Producto no encontrado" });

    const userDoc = await getResourceDoc(data.user_id, "users");

    if (userDoc.exists) {
        user = { id: userDoc.id, ...userDoc.data() };
    } else {
        user = null;
    }
    return res.json({
      state: billDoc.state,
      total: billDoc.total,
      table: billDoc.table,
      user,
      products: billDoc.products,
      id: billDoc.id,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error obteniendo producto", details: err.message });
  }
}

export async function updateBillById(req, res) {
  try {
    const billDoc = await db.collection("bills").doc(req.params.id).get();

    if (!billDoc.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    const data = req.body;

    await db.collection("products").doc(req.params.id).update(data);
    res.status(200).json({ message: "Cuenta actualizada correctamente" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al actualizar cuenta", details: err.message });
  }
}

export async function hardDeleteBill(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Se requiere el ID de la cuenta" });
    }

    // 1. Eliminar documento en "products"
    const billRef = db.collection("bills").doc(id);
    const billSnap = await billRef.get();

    if (billSnap.exists) {
      const billData = billSnap.data();

      // Eliminar el doc de products
      await billRef.delete();
    } else {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({
      message: "Producto y datos relacionados eliminados correctamente",
    });
  } catch (err) {
    // console.error("Error al eliminar producto:", err.message);
    res.status(500).json({
      error: "Error al eliminar producto",
      details: err.message,
    });
  }
}
