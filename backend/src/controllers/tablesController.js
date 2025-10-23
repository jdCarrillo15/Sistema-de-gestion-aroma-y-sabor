import { admin, db } from "../config/firebase.js";
import { getResourceDoc } from "../services/resourceService.js";


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

// Obtener una mesa por ID
export async function getTableById(req, res) {
    try {
        const { id } = req.params;
        const tableDoc = await getResourceDoc(id, "tables");

        if (!tableDoc) {
            return res.status(404).json({ error: "Mesa no encontrada" });
        }

        res.json({ id, ...tableDoc });
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo la mesa", details: err.message });
    }
}

// Crear una nueva mesa
export async function createTable(req, res) {
    try {
        const { number, capacity, status, current_bill_id } = req.body;

        if (!number || !capacity) {
            return res.status(406).json({ error: "Número y capacidad son obligatorios" });
        }

        // Verificar si ya existe una mesa con ese número
        const tableQuery = await db.collection("tables").where("number", "==", number).get();
        if (!tableQuery.empty) {
            return res.status(409).json({ error: "Ya existe una mesa con ese número" });
        }

        const newTable = {
            number,
            capacity,
            status: status || "available",
            current_bill_id: current_bill_id || null,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        };

        const tableRef = await db.collection("tables").add(newTable);

        res.status(201).json({ message: "Mesa creada correctamente", id: tableRef.id });
    } catch (err) {
        res.status(500).json({ error: "Error creando la mesa", details: err.message });
    }
}

// Cambiar el estado de una mesa
export async function changeTableStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, current_bill_id } = req.body;

        const tableRef = db.collection("tables").doc(id);
        const tableSnap = await tableRef.get();

        if (!tableSnap.exists) {
            return res.status(404).json({ error: "Mesa no encontrada" });
        }

        await tableRef.update({
            status: status || tableSnap.data().status,
            current_bill_id: current_bill_id ?? null,
        });

        res.json({ message: "Estado de la mesa actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: "Error actualizando estado de mesa", details: err.message });
    }
}

// Eliminar mesa de la base de datos
export async function deleteTable(req, res) {
    try {
        const { id } = req.params;
        const tableRef = db.collection("tables").doc(id);
        const tableSnap = await tableRef.get();

        if (!tableSnap.exists) {
            return res.status(404).json({ error: "Mesa no encontrada" });
        }

        await tableRef.delete();

        res.json({ message: "Mesa eliminada correctamente" });
    } catch (err) {
        res.status(500).json({ error: "Error eliminando la mesa", details: err.message });
    }
}
