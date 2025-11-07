import { admin, db } from "../config/firebase.js";
import { invalidateCache, getOrSetCache } from "../services/cacheService.js";
import { getIO } from "../sockets/socket.js";

function computeProductDiff(oldProducts = [], newProducts = []) {
  const diff = {};
  for (const p of oldProducts) diff[p.name] = (diff[p.name] || 0) - p.quantity;
  for (const p of newProducts) diff[p.name] = (diff[p.name] || 0) + p.quantity;
  return diff;
}

export async function getBills(req, res) {
  try {
    const bills = await getOrSetCache("bills:all", async () => {
      const billsSnap = await db.collection("bills").get();
      const usersSnap = await db.collection("users").get();
      const usersMap = new Map(usersSnap.docs.map(d => [d.id, d.data()]));

      return billsSnap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        user: usersMap.get(doc.data().user_id) || null,
      }));
    }, 120); // cache 2 minutos

    res.json({ bills });
  } catch (err) {
    res.status(500).json({ error: "Error al solicitar la cuenta", details: err.message });
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
    const billsRef = db.collection("bills");
    const existingBillSnap = await billsRef
      .where("table", "==", data.table)
      .where("status", "==", "open")
      .limit(1)
      .get();

    // Verificar si ya existe una cuenta abierta
    if (!existingBillSnap.empty) {
      const existingBill = existingBillSnap.docs[0];
      console.log(
        `Cuenta existente encontrada para la mesa ${data.table}: ${existingBill.id}`
      );

      return res.status(200).json({
        message: "Ya existe una cuenta abierta para esta mesa.",
        id: existingBill.id,
        existing: true,
      });
    }

    //Agregar el id del turno a la cuenta
    let shiftId = null;
    const userRef = db.collection("users").doc(data.user_id);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      const userData = userSnap.data();
      if (userData.current_shift_id) {
        shiftId = userData.current_shift_id;
      } else {
        console.log(`El usuario ${userData.user_name} no esta en turno activo`);// Temporal: Permitir crear cuenta sin turno
        //return res.status(400).json({ error: "El usuario no esta en turno activo." });
      }
    }

    const billData = {
      status: data.status || "open",
      total: data.total || 0,
      table: data.table,
      user_id: data.user_id,
      products: data.products || [],
      units_total: (data.products || []).reduce((acc, p) => acc + (Number(p.units || p.quantity) || 0), 0),
      product_ids: Array.from(new Set((data.products || []).map(p => p.id))).filter(Boolean),
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Temporal: Solo agregar el turno si existe
    if (shiftId) {
      billData.shift_id = shiftId;
      const shiftRef = db.collection("shifts").doc(shiftId);
      const updates = {
        total_sales: admin.firestore.FieldValue.increment(data.total || 0),
        total_bills: admin.firestore.FieldValue.increment(1),
      };
      (data.products || []).forEach((p) => {
        updates[`products_summary.${p.name}`] = admin.firestore.FieldValue.increment(p.quantity);
      });
      await shiftRef.update(updates);
      console.log(`Turno ${shiftId} actualizado al crear cuenta.`);
    }

    const billRef = await billsRef.add(billData);
    await invalidateCache("bills:all");
    await invalidateCache("bills:active");
    await invalidateCache("reports:all");

    // Actualizar la mesa correspondiente
    const tablesRef = db.collection("tables");
    const tableQuery = await tablesRef
      .where("number", "==", Number(data.table))
      .limit(1)
      .get();

    if (!tableQuery.empty) {
      const tableDoc = tableQuery.docs[0];
      await tableDoc.ref.update({
        current_bill_id: billRef.id,
        status: "occupied",
      });
    }

    const io = getIO();

    const newBillData = {
      id: billRef.id,
      table: data.table,
      total: data.total || 0,
      products: data.products || [],
      created_at: new Date().toISOString(),
    };

    io.to("cash").emit("nuevaCuenta", newBillData);
    io.to("kitchen").emit("nuevaCuenta", newBillData);

    return res.status(201).json({
      message: "Cuenta creada correctamente",
      id: billRef.id,
      existing: false,
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
      status: billData.status,
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

export async function getActiveBills(req, res) {
  try {
    const bills = await getOrSetCache("bills:active", async () => {
      const billsSnap = await db
        .collection("bills")
        .where("status", "==", "open")
        .get();

      if (billsSnap.empty) {
        return [];
      }

      return billsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    });

    return res.json({ bills });
  } catch (error) {
    console.error("Error al obtener cuentas activas:", error);
    res.status(500).json({
      error: "Error al obtener las cuentas activas",
      details: error.message,
    });
  }
}


export async function updateBillById(req, res) {
  try {
    const billId = req.params.id;
    const updateData = req.body;

    const billRef = db.collection("bills").doc(billId);
    const billSnap = await billRef.get();

    if (!billSnap.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    const oldBill = billSnap.data();

    if (Array.isArray(updateData.products)) {
      updateData.units_total = updateData.products.reduce(
        (acc, p) => acc + (Number(p.units) || 0),
        0
      );
    }

    await billRef.update(updateData);

    if (oldBill.shift_id) {
      const shiftRef = db.collection("shifts").doc(oldBill.shift_id);
      const productDiff = computeProductDiff(oldBill.products, updateData.products || []);
      const totalDiff = (updateData.total || 0) - (oldBill.total || 0);

      if (totalDiff !== 0 || Object.keys(productDiff).length > 0) {
        const updates = { total_sales: admin.firestore.FieldValue.increment(totalDiff) };
        for (const [name, qty] of Object.entries(productDiff)) {
          updates[`products_summary.${name}`] = admin.firestore.FieldValue.increment(qty);
        }
        await shiftRef.update(updates);
      }
    }


    const io = getIO();

    //Si el estado pasa a 'paid' o 'closed', se libera la mesa
    if (updateData.status === "paid" || updateData.status === "closed") {
      await invalidateCache("bills:active");
      await invalidateCache("bills:all");
      const tablesRef = db.collection("tables");
      const tableQuery = await tablesRef
        .where("number", "==", Number(oldBill.table))
        .limit(1)
        .get();

      if (!tableQuery.empty) {
        const tableDoc = tableQuery.docs[0];
        await tableDoc.ref.update({
          status: "free",
          current_bill_id: null,
        });
      }
      if (updateData.total !== undefined || updateData.products) {
        await invalidateCache("reports:all");
      }

      io.to("cash").emit("cuentaEliminada", { id: billId });
      io.to("waiter").emit("cuentaEliminada", { id: billId });
      io.to("kitchen").emit("cuentaEliminada", { id: billId });
    }


    io.to("cash").emit("cuentaActualizada", {
      id: billId,
      data: updateData,
    });
    io.to("kitchen").emit("cuentaActualizada", {
      id: billId,
      data: updateData,
    });

    return res.status(200).json({ message: "Cuenta actualizada correctamente" });
  } catch (err) {
    return res.status(500).json({
      error: "Error al actualizar cuenta",
      details: err.message,
    });
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
    const bill = billSnap.data();


    if (!billSnap.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    if (bill.shift_id) {
      const shiftRef = db.collection("shifts").doc(bill.shift_id);
      const updates = {
        total_sales: admin.firestore.FieldValue.increment(-bill.total),
        total_bills: admin.firestore.FieldValue.increment(-1),
      };
      (bill.products || []).forEach((p) => {
        updates[`products_summary.${p.name}`] = admin.firestore.FieldValue.increment(-p.units);
      });
      await shiftRef.update(updates);

    }

    // Liberar la mesa asociada
    const tablesRef = db.collection("tables");
    const tableQuery = await tablesRef
      .where("current_bill_id", "==", id)
      .limit(1)
      .get();

    if (!tableQuery.empty) {
      const tableDoc = tableQuery.docs[0];
      await tableDoc.ref.update({
        current_bill_id: null,
        status: "free",
      });
    }

    await billRef.delete();
    await invalidateCache("bills:active");
    await invalidateCache("bills:all");
    await invalidateCache("reports:all");


    const io = getIO();
    io.to("cash").emit("cuentaEliminada", { id });
    io.to("kitchen").emit("cuentaEliminada", { id });

    res.status(200).json({
      message: "Cuenta eliminada correctamente",
    });
  } catch (err) {
    res.status(500).json({
      error: "Error al eliminar cuenta",
      details: err.message,
    });
  }
}

export async function addProductToBill(req, res) {
  const { id } = req.params;
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(406).json({ error: "Se requiere al menos un producto a agregar" });
  }

  try {
    const enrichedProducts = [];

    // Solo leer los productos cuando sea necesario (por tipo o stock)
    const idsToCheck = products.map(p => p.id);
    const chunks = [];
    while (idsToCheck.length) chunks.push(idsToCheck.splice(0, 10)); // Firestore 'in' máx 10

    const productsMap = new Map();

    for (const chunk of chunks) {
      const snap = await db.collection("products")
        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
        .get();

      snap.docs.forEach(doc => {
        productsMap.set(doc.id, doc.data());
      });
    }

    // Validación y actualización de stock
    for (const item of products) {
      const productData = productsMap.get(item.id);

      if (!productData) {
        return res.status(404).json({ error: `El producto ${item.id} no existe.` });
      }

      // Si es un producto no preparado, controla el stock
      if (productData.type === "nonprepared") {
        if (productData.stock < item.units) {
          return res.status(400).json({
            error: `No hay suficiente stock para ${productData.name}. Stock disponible: ${productData.stock}`,
          });
        }

        await db.collection("products").doc(item.id).update({
          stock: admin.firestore.FieldValue.increment(-item.units),
          status: productData.stock - item.units <= 0 ? "inactive" : "active",
        });
      }

      // Copiamos precio y nombre locales para mantener consistencia histórica
      enrichedProducts.push({
        id: item.id,
        name: productData.name,
        units: item.units,
        price: productData.price || 0,
        process: item.process || "pending",
        type: productData.type,
      });
    }

    // Actualizar cuenta
    const billRef = db.collection("bills").doc(id);
    const billSnap = await billRef.get();

    if (!billSnap.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    const billData = billSnap.data();
    const updatedProducts = [...(billData.products || []), ...enrichedProducts];

    const total = await calculateTotal(updatedProducts);

    await billRef.update({
      products: updatedProducts,
      total,
      units_total: updatedProducts.reduce((acc, p) => acc + (Number(p.units) || 0), 0),
      product_ids: admin.firestore.FieldValue.arrayUnion(...enrichedProducts.map(p => p.id)),
    });

    await invalidateCache("bills:active");
    await invalidateCache("bills:all");
    await invalidateCache("reports:all");


    // Actualizar turno si existe
    if (billData.shift_id) {
      const shiftRef = db.collection("shifts").doc(billData.shift_id);
      const shiftUpdates = {
        total_sales: admin.firestore.FieldValue.increment(
          enrichedProducts.reduce((acc, p) => acc + p.price * p.units, 0)
        ),
      };
      enrichedProducts.forEach((p) => {
        shiftUpdates[`products_summary.${p.name}`] =
          admin.firestore.FieldValue.increment(p.units);
      });
      await shiftRef.update(shiftUpdates);
    }

    const io = getIO();
    io.to("kitchen").emit("nuevoProducto", enrichedProducts.map(p => ({
      ...p,
      table: billData.table,
      billId: id,
      created_at: billData.created_at,
    })));
    io.to("cash").emit("cuentaActualizada", {
      id,
      data: { products: updatedProducts, total },
    });

    res.status(201).json({
      message: "Producto agregado a la cuenta correctamente",
      total,
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
  const { id } = req.params;
  const { productId } = req.body;

  try {
    const billRef = db.collection("bills").doc(id);
    const billSnap = await billRef.get();

    if (!billSnap.exists) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    const billData = billSnap.data();
    const updatedProducts = (billData.products || []).filter(p => p.id !== productId);

    await billRef.update({
      products: updatedProducts,
      units_total: updatedProducts.reduce((acc, p) => acc + (Number(p.units) || 0), 0),
      product_ids: Array.from(new Set(updatedProducts.map(p => p.id))).filter(Boolean),
    });

    await invalidateCache("bills:active");
    await invalidateCache("reports:all");


    const io = getIO();

    io.to("kitchen").emit("productoEliminado", { billId: id, productId });

    io.to("cash").emit("cuentaActualizada", { id, data: { products: updatedProducts } });

    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    res.status(500).json({
      error: "Error al eliminar producto",
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

    await billRef.update({
      products: currentProducts,
      total,
      units_total: currentProducts.reduce((acc, p) => acc + (Number(p.units) || 0), 0),
      product_ids: Array.from(new Set(currentProducts.map(p => p.id))).filter(Boolean),
    });

    await invalidateCache("bills:active");
    await invalidateCache("reports:all");


    const io = getIO();
    io.to("cash").emit("cuentaActualizada", { id, data: { products: currentProducts, total } });
    io.to("kitchen").emit("pedidoActualizado", {
      billId: id,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        units: p.units,
        process: p.process,
        billId: id,
        table: billData.table,
        created_at: billData.created_at,
      })),
    });


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
      await billRef.update({ status: "closed" });
      await invalidateCache("bills:active");
      await invalidateCache("bills:all");


      //Liberar la mesa asociada
      const tablesRef = db.collection("tables");
      const tableQuery = await tablesRef
        .where("current_bill_id", "==", id)
        .limit(1)
        .get();

      if (!tableQuery.empty) {
        const tableDoc = tableQuery.docs[0];
        await tableDoc.ref.update({
          current_bill_id: null,
          status: "free",
        });
      }

      const io = getIO();
      io.to("cash").emit("cuentaEliminada", { id });
      io.to("kitchen").emit("cuentaEliminada", { id });

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
    await invalidateCache("reports:all");

    res.status(200).json({ total });
  } catch (err) {
    res.status(500).json({
      error: "Error al calcular el total de la cuenta",
      details: err.message,
    });
  }
}

async function calculateTotal(products = []) {
  if (!Array.isArray(products) || products.length === 0) return 0;

  // Calcular el total directamente con los precios ya guardados en los productos
  const total = products.reduce((acc, p) => {
    const price = Number(p.price) || 0;
    const units = Number(p.units) || 0;
    return acc + price * units;
  }, 0);

  return Number(total.toFixed(2)); // redondeo a 2 decimales
}


export async function changeProductStateInBill(req, res) {
  try {
    const { id } = req.params;
    const { productId, newState } = req.body;
    if (!productId || !newState) {
      return res.status(400).json({ error: "Se requieren productId y newState" });
    }

    const billRef = db.collection("bills").doc(id);
    const billSnap = await billRef.get();
    if (!billSnap.exists) return res.status(404).json({ error: "Cuenta no encontrada" });

    const billData = billSnap.data();
    const products = billData.products || [];

    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, process: newState } : p
    );

    await billRef.update({ products: updatedProducts });

    const io = getIO();
    io.to("kitchen").emit("productoActualizado", {
      billId: id,
      table: billData.table,
      productId,
      newState,
    });
    io.to("waiter").emit("productoActualizado", {
      billId: id,
      table: billData.table,
      productId,
      newState,
    });

    if (newState === "ready") {
      const productInfo = products.find(p => p.id === productId);
      io.to("waiter").emit("productoListo", {
        billId: id,
        table: billData.table,
        productId,
        productName: productInfo?.name || "Producto",
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      message: "Estado del producto actualizado correctamente",
      updatedProductIds: products.filter(p => p.id === productId).map(p => p.id),
    });
  } catch (err) {
    console.error("Error al actualizar estado del producto:", err);
    res.status(500).json({
      error: "Error al actualizar el estado del producto",
      details: err.message,
    });
  }
}



