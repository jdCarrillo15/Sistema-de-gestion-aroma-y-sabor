import { admin, db } from "../config/firebase.js";
import { getResourceDoc } from "../services/resourceService.js";
import { getOrSetCache, deleteCache, deleteCachePattern } from "../config/redis.js";

export async function getProducts(req, res) {
  try {
    const CACHE_KEY = "products:all";
    const TTL = 3600; // 1 hora

    const products = await getOrSetCache(
      CACHE_KEY,
      async () => {
        const productSnapshot = await db.collection("products").get();

        if (productSnapshot.empty) {
          return [];
        }

        const products = productSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            price: data.price,
            status: data.status,
            stock: data.stock,
            type: data.type,
          };
        });

        return products;
      },
      TTL
    );

    res.json({ products });
  } catch (err) {
    res.status(500).json({
      error: "Error obteniendo productos",
      details: err.message,
    });
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

    await deleteCache("products:all");  
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

    if (Object.prototype.hasOwnProperty.call(data, "stock") && Number(data.stock) > 0) {
      data.status = "active";
    }

    await db.collection("products").doc(req.params.id).update(data);

    await deleteCache("products:all");
    await deleteCache(`product:${req.params.id}`);

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
      await deleteCache("products:all");
      await deleteCache(`product:${id}`);
    }else{
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({
      message: "Producto y datos relacionados eliminados correctamente",
    });
  } catch (err) {
    
    res.status(500).json({
      error: "Error al eliminar producto",
      details: err.message,
    });
  }
}
