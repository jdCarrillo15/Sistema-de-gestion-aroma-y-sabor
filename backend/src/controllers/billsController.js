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

        if (userDoc != null) {
          user = { id: userDoc.id, ...userDoc.data() };
        } else {
          console.log(userDoc);
          user = null;
        }
        if (!data.products) {
          res
            .status(400)
            .json({
              error: "Error obteniendo productos, la cuenta no tiene productos",
            });
        }

        return {
          state: data.state,
          total: data.total,
          table: data.table,
          created_at: data.created_at,
          user: user,
          products: data.products,
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

//CRUD functions
//documentación en comentarios con estructura de peticion esperada --- IGNORE ---
/**
 * @route POST /bills/createBill
 * @desc Crea una nueva cuenta en la base de datos
 * @body {object} data - Objeto con los campos de la cuenta (state, total, table, user_id, products)
 * @returns {object} Mensaje de éxito o error
 * @example
 * // Petición
 * POST /bills/createBill
 * {
 *   "state": "open",
 *   "total": 150.00,
 *   "table": 5,
 *   "user_id": "user123",
 *   "products": [
 *     {
 *       "id": "prod1",
 *       "name": "Producto 1",
 *       "units": 2,
 *       "process": "in process"
 *     },
 *     {
 *       "id": "prod2",
 *       "name": "Producto 2",
 *       "units": 1,
 *       "process": "done"
 *     }
 *   ]
 * }
 */
export async function createBill(req, res) {
  const data = req.body;
  if (!data.table || !data.user_id) {
    return res.status(406).json({
      error:
        "Debe tener una mesa, un usuario y al menos un producto o ninguno para crear una cuenta.",
    });
  }

  try {
    let productsIds = data.products;
    for (const item of productsIds) {
      const productDoc = await db
        .collection("products")
        .where("id", "==", item.id)
        .limit(1)
        .get();

      if (productDoc.empty || productDoc.docs[0].stock < item.units) {
        return res.status(404).json({
          error: `El producto ${item.id} no existe o no hay suficiente stock.`,
        });
      } else {
        await db
          .collection("products")
          .doc(productDoc.docs[0].id)
          .update({
            stock: admin.firestore.FieldValue.increment(-item.units),
          });
      }
    }
    // 1. Crear documento en "products"
    await db.collection("bills").add({
      state: data.state || "open",
      total: data.total,
      table: data.table,
      user_id: data.user_id,
      products: data.products,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "Cuenta creada correctamente" });
  } catch (error) {
    res.status(500).json({
      error: "Error al crear la cuenta",
      details: error.message,
    });
  }
}

/**
 * @route GET /bills/getBill/:id
 * @desc Obtiene una cuenta por su ID, incluyendo los datos del usuario asociado
 * @param {string} id - ID de la cuenta a obtener
 * @returns {object} Objeto de la cuenta con detalles del usuario o mensaje de error
 * @example
 * // Petición
 * GET /bills/getBill/abc123
 *
 * // Respuesta exitosa
 * {
 *   "id": "abc123",
 *   "state": "open",
 *   "total": 150.00,
 *   "table": 5,
 *   "user": {
 *     "id": "user123",
 *     "user_name": "johndoe",
 *     "email": "
 *   }
 * }
 */
export async function getBillById(req, res) {
  try {
    const { id } = req.params;
    const billData = await getResourceDoc(id, "bills");

    if (!billData) {
      return res.status(404).json({ error: "Cuenta no encontrada" });
    }

    let user = null;

    if (billData.user_id) {
      const userData = await getResourceDoc(billData.user_id, "users");

      if (userData) {
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

/**
 * @route PUT /bills/updateBill/:id
 * @desc Actualiza una cuenta existente en la base de datos
 * @param {string} id - ID de la cuenta a actualizar
 * @body {object} data - Objeto con los campos a actualizar (state, total, table, user_id, products)
 * @returns {object} Mensaje de éxito o error
 * @example
 * // Petición
 * PUT /bills/updateBill/abc123
 * {
 *   "state": "open",
 *   "total": 150.00,
 *   "table": 5,
 *   "user_id": "user123",
 *   "products": [
 *     {
 *       "id": "prod1",
 *       "name": "Producto 1",
 *       "units": 2,
 *       "process": "in process"
 *     },
 *     {
 *       "id": "prod2",
 *       "name": "Producto 2",
 *       "units": 1,
 *       "process": "done"
 *     }
 *   ]
 * }
 */
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

/**
 * @route DELETE /bills/harddeleteBill/:id
 * @desc Elimina una cuenta y sus datos relacionados de la base de datos
 * @param {string} id - ID de la cuenta a eliminar
 * @returns {object} Mensaje de éxito o error
 * @example
 * // Petición
 * DELETE /bills/harddeleteBill/abc123
 */
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
      return res.status(404).json({ error: "Cuenta no encontrado" });
    }

    res.status(200).json({
      message: "Cuenta y datos relacionados eliminados correctamente",
    });
  } catch (err) {
    res.status(500).json({
      error: "Error al eliminar Cuenta",
      details: err.message,
    });
  }
}

/**
 * @route POST /bills/addProductToBill/:id
 * @desc Agrega un producto a una cuenta existente
 * @param {string} id - ID de la cuenta a la que se agregará el producto
 * @body {array} products - Array con uno o más productos a agregar
 * @returns {object} Mensaje de éxito o error
 * @example
 * // Petición
 * POST /bills/addProductToBill/abc123
 * {
 *   "products": [
 *     {
 *       "id": "prod1",
 *       "name": "Producto Ejemplo",
 *       "units": 1,
 *       "process": "in process"
 *     }
 *   ]
 * }
 */
export async function addProductToBill(req, res) {
  const { id } = req.params;
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res
      .status(406)
      .json({ error: "Se requiere al menos un producto a agregar" });
  }
  for (const item of products) {
    const productDoc = await db
      .collection("products")
      .where("id", "==", item.id)
      .limit(1)
      .get();

    if (!productDoc.exists || productDoc.docs[0].stock < item.units) {
      return res.status(404).json({
        error: `El producto ${item.id} no existe o no hay suficiente stock.`,
      });
    } else {
      await db
        .collection("products")
        .doc(productDoc.docs[0].id)
        .update({
          stock: admin.firestore.FieldValue.increment(-item.units),
        });
    }
  }

  try {
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
    res.status(500).json({
      error: "Error al agregar producto",
      details: err.message,
    });
  }
}

/**
 * @route POST /bills/removeProductFromBill/:id
 * @desc Elimina un producto de una cuenta existente
 * @param {string} id - ID de la cuenta de la que se eliminará el producto
 * @body {string} productId - ID del producto a eliminar
 * @returns {object} Mensaje de éxito o error
 * @example
 * // Petición
 * POST /bills/removeProductFromBill/abc123
 * {
 *   "productId": "prod1"
 * }
 */
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
    const updatedProducts = (billData.products || []).filter(
      (p) => p.id !== productId
    );
    const total = await calculateTotal(updatedProducts);
    await billRef.update({ products: updatedProducts, total });

    res
      .status(200)
      .json({
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

/**
 * @route PUT /bills/closeBillIfEmpty/:id
 * @desc Cierra una cuenta si no tiene productos asociados
 * @param {string} id - ID de la cuenta a cerrar
 * @returns {object} Mensaje de éxito o error
 * @example
 * // Petición
 * PUT /bills/closeBillIfEmpty/abc123
 */
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

/**
 * @route PUT /bills/updateProductsInBill/:id
 * @desc Actualiza los productos de una cuenta existente
 * @param {string} id - ID de la cuenta a la que se actualizarán los productos
 * @body {array} products - Array de objetos de productos a actualizar o agregar (cada objeto debe contener al menos un campo 'id')
 * @returns {object} Mensaje de éxito o error
 * @example
 * // Petición
 * PUT /bills/updateProductsInBill/abc123
 * {
 *   "products": [
 *     {
 *       "id": "prod1",
 *       "name": "Producto Actualizado",
 *       "units": 2,
 *       "process": "in process"
 *     },
 *     {
 *       "id": "prod2",
 *       "name": "Nuevo Producto",
 *       "units": 1,
 *       "process": "in process"
 *     }
 *   ]
 * }
 */
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

    // Actualizar los productos existentes o agregar nuevos
    products.forEach((updatedProduct) => {
      const index = currentProducts.findIndex(
        (p) => p.id === updatedProduct.id
      );
      if (index !== -1) {
        currentProducts[index] = {
          ...currentProducts[index],
          ...updatedProduct,
        };
      } else {
        currentProducts.push(updatedProduct);
      }
    });

    const total = await calculateTotal(currentProducts);

    await billRef.update({ products: currentProducts, total });

    res
      .status(200)
      .json({
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

/**
 * @route POST /bills/calculateBillTotal/:id
 * @desc Calcula el total de una cuenta sumando los precios de los productos asociados
 * @param {string} id - ID de la cuenta a calcular el total
 * @returns {object} Total calculado o mensaje de error
 * @example
 * // Petición
 * POST /bills/calculateBillTotal/abc123
 */
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
    const productDoc = await db
      .collection("products")
      .where("id", "==", item.id)
      .limit(1)
      .get();

    if (!productDoc.empty) {
      const productData = productDoc.docs[0].data();
      total += productData.price * item.units;
    }
  }

  return total;
}

/**
 * @route PUT /bills/changeProductStateInBill/:id
 * @desc Cambia el estado de un producto dentro de una cuenta existente
 * @param {string} id - ID de la cuenta que contiene el producto
 * @body {string} productId - ID del producto cuyo estado se va a cambiar
 * @body {string} newState - Nuevo estado del producto (por ejemplo, "in process", "done")
 * @returns {object} Mensaje de éxito o error
 * @example
 * // Petición
 * PUT /bills/changeProductStateInBill/abc123
 * {
 *   "productId": "prod1",
 *   "newState": "done"
 * }
 */
export async function changeProductStateInBill(req, res) {
  try {
    const { id } = req.params; // ID de la cuenta
    const { productId, newState } = req.body; // ID del producto y nuevo estado

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

    res
      .status(200)
      .json({ message: "Estado del producto actualizado correctamente" });
  } catch (err) {
    res.status(500).json({
      error: "Error al actualizar el estado del producto en la cuenta",
      details: err.message,
    });
  }
}
