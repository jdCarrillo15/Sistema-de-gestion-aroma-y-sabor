import { admin, db } from "../config/firebase.js";
import { getResourceDoc } from "../services/resourceService.js";

export async function getProducts(req, res) {
  try {
    const product = await db.collection("products").get();

    if (product.empty) {
      return res.json({ products: [] });
    }

    const products = await Promise.all(
      product.docs.map(async (doc) => {
        const data = doc.data();


        return {
          id: doc.id,
          name: data.name,
          price: data.price,
          status: data.status,
          stock: data.stock,
          type: data.type,
        };
      })
    );

    res.json({ products });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error obteniendo productos", details: err.message });
  }
}

//CRUD functions
export async function createProduct(req, res) {
  const data = req.body;
  if (!data.name || !data.price) {
    return res.status(406).json({ error: "Name y price son obligatorios" });
  }
  try {

    if (data.type == "") {
        data.type = "nonprepared";
    }

    // 1. Crear documento en "products"
    await db
      .collection("products")
      .add({
        name: data.name,
        price: data.price,
        status: data.status,
        stock: data.stock,
        type: data.type || "nonprepared",
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

    res.status(201).json({
      message: "Producto creado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al crear el producto",
      details: error.message,
    });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const productDoc = await getResourceDoc(id, "products");

    if (!productDoc)
      return res.status(404).json({ error: "Producto no encontrado" });

    return res.json({
        id: productDoc.id,
        name: productDoc.name,
        price: productDoc.price,
        status: productDoc.status,
        stock: productDoc.stock,
        type: productDoc.type,
        created_at: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error obteniendo producto", details: err.message });
  }
}

export async function updateProductById(req, res) {
  try {
    const productDoc = await db.collection("products").doc(req.params.id).get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const data = req.body;

    await db.collection("products").doc(req.params.id).update(data);
    res.status(200).json({ message: "Producto actualizado correctamente" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al actualizar producto", details: err.message });
  }
}

export async function hardDeleteProduct(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Se requiere el ID del producto" });
    }

    // 1. Eliminar documento en "products"
    const productRef = db.collection("products").doc(id);
    const productSnap = await productRef.get();

    if (productSnap.exists) {
      const productData = productSnap.data();

      // Eliminar el doc de products
      await productRef.delete();
    }else{
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
