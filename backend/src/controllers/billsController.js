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

        const userDoc = await db.collection("users").doc(data.user_id).get();

        if (userDoc.exists) {
          user = { id: userDoc.id, ...userDoc.data() };
        }

        return {
          state: data.state,
          total: data.total,
          table: data.table,
          created_at: data.created_at,
          user: user,
          products: data.products || [],
          id: doc.id,
        };
      })
    );

    res.json({ bills });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al solicitar la cuenta", details: err.message });
  }
}

export async function createBill(req, res) {
  const data = req.body;
  if (!data.table || !data.user_id) {
    return res.status(406).json({
      error: "Debe tener una mesa y un usuario para crear una cuenta.",
    });
  }

  try {
    if (data.products && data.products.length > 0) {
      for (const item of data.products) {
        const productDoc = await db.collection("products").doc(item.id).get();

        if (!productDoc.exists) {
          return res.status(404).json({
            error: `El producto ${item.id} no existe.`,
          });
        }

        const productData = productDoc.data();
        if (productData.stock < item.units) {
          return res.status(400).json({
            error: `No hay suficiente stock para ${productData.name}. Stock disponible: ${productData.stock}`,
          });
        }

        await db
          .collection("products")
          .doc(item.id)
          .update({
            stock: admin.firestore.FieldValue.increment(-item.units),
          });
      }
    }

    const billRef = await db.collection("bills").add({
      state: data.state || "open",
      total: data.total || 0,
      table: data.table,
      user_id: data.user_id,
      products: data.products || [],
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: "Cuenta creada correctamente",
      id: billRef.id,
    });
  } catch (error) {
    console.error("Error al crear cuenta:", error);
    res.status(500).json({
      error: "Error al crear la cuenta",
      details: error.message,
    });
  }
}

export async function getBillById(req, res) {
  try {
    const { id } = req.params;
    const billDoc = await db.collection("bills").doc(id).get();

    if (!billDoc.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    const billData = billDoc.data();
    let user = null;

    if (billData.user_id) {
      const userData = await db.collection("users").doc(billData.user_id).get();
      if (userData.exists) {
        user = { id: billData.user_id, ...userData.data() };
      }
    }

    return res.json({
      id: id,
      state: billData.state,
      total: billData.total,
      table: billData.table,
      user,
      products: billData.products || [],
      created_at: billData.created_at,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error obteniendo cuenta",
      details: err.message,
    });
  }
}

export async function updateBillById(req, res) {
  try {
    const billDoc = await db.collection("bills").doc(req.params.id).get();

    if (!billDoc.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    const data = req.body;

    await db.collection("bills").doc(req.params.id).update(data);
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

    const billRef = db.collection("bills").doc(id);
    const billSnap = await billRef.get();

    if (!billSnap.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    await billRef.delete();

    res.status(200).json({
      message: "Cuenta eliminada correctamente",
    });
  } catch (err) {
    res.status(500).json({
      error: "Error al eliminar Cuenta",
      details: err.message,
    });
  }
}

export async function addProductToBill(req, res) {
  const { id } = req.params;
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res
      .status(406)
      .json({ error: "Se requiere al menos un producto a agregar" });
  }

  try {
    for (const item of products) {
      const productDoc = await db.collection("products").doc(item.id).get();

      if (!productDoc.exists) {
        return res.status(404).json({
          error: `El producto ${item.id} no existe.`,
        });
      }

      const productData = productDoc.data();

      if (productData.stock < item.units) {
        return res.status(400).json({
          error: `No hay suficiente stock para ${productData.name}. Stock disponible: ${productData.stock}`,
        });
      }

      await db
        .collection("products")
        .doc(item.id)
        .update({
          stock: admin.firestore.FieldValue.increment(-item.units),
        });
    }

    const billRef = db.collection("bills").doc(id);
    const billSnap = await billRef.get();

    if (!billSnap.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    const billData = billSnap.data();
    const updatedProducts = [...(billData.products || []), ...products];

    const total = await calculateTotal(updatedProducts);

    await billRef.update({
      products: updatedProducts,
      total: total,
    });

    res.status(201).json({
      message: "Producto agregado a la cuenta correctamente",
      total: total,
    });
  } catch (err) {
    console.error("Error al agregar producto:", err);
    res.status(500).json({
      error: "Error al agregar producto",
      details: err.message,
    });
  }
}

export async function removeProductFromBill(req, res) {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ error: "Se requiere el ID del producto a eliminar" });
    }

    const billRef = db.collection("bills").doc(id);
    const billSnap = await billRef.get();

    if (!billSnap.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    const billData = billSnap.data();

    
    const productToRemove = (billData.products || []).find(p => p.id === productId);
    if (productToRemove) {
      await db.collection("products").doc(productToRemove.id).update({
        stock: admin.firestore.FieldValue.increment(productToRemove.units),
      });
    }

    const updatedProducts = (billData.products || []).filter(
      (p) => p.id !== productId
    );

    const total = await calculateTotal(updatedProducts);
    await billRef.update({ products: updatedProducts, total });

    res.status(200).json({
      message: "Producto eliminado de la cuenta correctamente",
      total,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error al eliminar producto de la cuenta",
      details: err.message,
    });
  }
}

export async function updateProductsInBill(req, res) {
  try {
    const { id } = req.params;
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res
        .status(400)
        .json({ error: "Se requiere un array de productos para actualizar" });
    }

    const billRef = db.collection("bills").doc(id);
    const billSnap = await billRef.get();

    if (!billSnap.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    const billData = billSnap.data();
    const currentProducts = billData.products || [];

    
    for (const updatedProduct of products) {
      const existing = currentProducts.find(p => p.id === updatedProduct.id);
      if (existing) {
        const diff = updatedProduct.units - existing.units;
        if (diff !== 0) {
          await db.collection("products").doc(updatedProduct.id).update({
            stock: admin.firestore.FieldValue.increment(-diff),
          });
        }
      } else {
        
        await db.collection("products").doc(updatedProduct.id).update({
          stock: admin.firestore.FieldValue.increment(-updatedProduct.units),
        });
      }
    }

    
    products.forEach((updatedProduct) => {
      const index = currentProducts.findIndex(
        (p) => p.id === updatedProduct.id
      );
      if (index !== -1) {
        currentProducts[index] = { ...currentProducts[index], ...updatedProduct };
      } else {
        currentProducts.push(updatedProduct);
      }
    });

    const total = await calculateTotal(currentProducts);

    await billRef.update({ products: currentProducts, total });

    res.status(200).json({
      message: "Productos de la cuenta actualizados correctamente",
      total,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error al actualizar productos de la cuenta",
      details: err.message,
    });
  }
}

export async function closeBillIfEmpty(req, res) {
  try {
    const { id } = req.params;

    const billRef = db.collection("bills").doc(id);
    const billSnap = await billRef.get();

    if (!billSnap.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    const billData = billSnap.data();

    if (!billData.products || billData.products.length === 0) {
      await billRef.update({ state: "closed" });
      return res.status(200).json({ message: "Cuenta cerrada correctamente" });
    } else {
      return res
        .status(400)
        .json({ error: "La cuenta no está vacía, no se puede cerrar" });
    }
  } catch (err) {
    res.status(500).json({
      error: "Error al cerrar la cuenta",
      details: err.message,
    });
  }
}

export async function calculateBillTotal(req, res) {
  try {
    const { id } = req.params;

    const billRef = db.collection("bills").doc(id);
    const billSnap = await billRef.get();

    if (!billSnap.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    const billData = billSnap.data();
    const total = await calculateTotal(billData.products || []);

    await billRef.update({ total });

    res.status(200).json({ total });
  } catch (err) {
    res.status(500).json({
      error: "Error al calcular el total de la cuenta",
      details: err.message,
    });
  }
}

async function calculateTotal(products) {
  let total = 0;

  for (const item of products) {
    const productDoc = await db.collection("products").doc(item.id).get();

    if (productDoc.exists) {
      const productData = productDoc.data();
      total += productData.price * item.units;
    }
  }

  return total;
}

export async function changeProductStateInBill(req, res) {
  try {
    const { id } = req.params;
    const { productId, newState } = req.body;

    if (!productId || !newState) {
      return res
        .status(400)
        .json({ error: "Se requieren productId y newState" });
    }

    const billRef = db.collection("bills").doc(id);
    const billSnap = await billRef.get();

    if (!billSnap.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    const billData = billSnap.data();
    const products = billData.products || [];

    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
      return res
        .status(404)
        .json({ error: "Producto no encontrado en la cuenta" });
    }

    products[productIndex].process = newState;

    await billRef.update({ products });

    res.status(200).json({
      message: "Estado del producto actualizado correctamente",
    });
  } catch (err) {
    res.status(500).json({
      error: "Error al actualizar el estado del producto en la cuenta",
      details: err.message,
    });
  }
}