import admin from "firebase-admin";
const db = admin.firestore();

/**
 * Obtener todas las mesas
 */
export async function getTables(req, res) {
    try {
        const snapshot = await db.collection("tables").get();

        if (snapshot.empty) {
            return res.json({ tables: [] });
        }

        const tables = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.json({ tables });
    } catch (err) {
        console.error("Error obteniendo mesas:", err);
        res.status(500).json({
            error: "Error al obtener mesas",
            details: err.message,
        });
    }
}

/**
 * Actualizar datos de una mesa (status, current_bill_id, etc.)
 */
export async function updateTable(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        const tableRef = db.collection("tables").doc(id);
        const tableSnap = await tableRef.get();

        if (!tableSnap.exists) {
            return res.status(404).json({ error: "Mesa no encontrada" });
        }

        await tableRef.update(updates);

        res.json({ message: "Mesa actualizada correctamente" });
    } catch (err) {
        console.error("Error actualizando mesa:", err);
        res.status(500).json({
            error: "Error al actualizar mesa",
            details: err.message,
        });
    }
}

/**
 * Marcar mesa como libre (cuando se cierra o elimina la cuenta)
 */
export async function freeTable(req, res) {
    try {
        const { id } = req.params;

        const tableRef = db.collection("tables").doc(id);
        const tableSnap = await tableRef.get();

        if (!tableSnap.exists) {
            return res.status(404).json({ error: "Mesa no encontrada" });
        }

        await tableRef.update({
            status: "free",
            current_bill_id: null,
        });

        res.json({ message: "Mesa liberada correctamente" });
    } catch (err) {
        console.error("Error liberando mesa:", err);
        res.status(500).json({
            error: "Error al liberar mesa",
            details: err.message,
        });
    }
}
