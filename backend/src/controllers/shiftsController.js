import { admin, db } from "../config/firebase.js";
import { getOrSetCache, invalidateCache } from "../services/cacheService.js";
import { getIO } from "../sockets/socket.js";

const TTL_SHIFTS = parseInt(process.env.CACHE_TTL_SHIFTS || "120");  // 2 minutos
const TTL_SHIFT_DETAIL = parseInt(process.env.CACHE_TTL_SHIFT_DETAIL || "120");


/**
 * Obtiene todos los turnos
 * @param {*} req
 * @param {*} res
 *
 * @returns
 * {
 * "shifts": [
 *    {
 *      "id": "shiftId",
 *      "user_id": "RivCWLOk3zcxqebSo2pzIB1xUnp2",
 *      "state": "open",
 *      "started_at": "2025-10-29T07:00:00-05:00",
 *      "finished_at": null,
 *      "total_bills": 2,
 *      "total_sales": 35600,
 *      "products_summary": {
 *        "Cerveza Aguila": 1,
 *        "Empanada Pollo": 1,
 *        "Galletas de sal": 1,
 *        "Tea 250ml": 3,
 *        "Tinto": 5
 *      }
 *    }
 *  ]
 * }
 */
export async function getShifts(req, res) {
  try {
    const shifts = await getOrSetCache("shifts:all", async () => {
      const snapshot = await db
        .collection("shifts")
        .orderBy("started_at", "desc")
        .get();

      if (snapshot.empty) return [];

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }, TTL_SHIFTS);

    return res.json({ shifts });
  } catch (err) {
    return res.status(500).json({
      error: "Error al obtener turnos",
      details: err.message,
    });
  }
}

/**
 * Crea un nuevo turno
 * @param {*} req
 * {
 * "user_id": "RivCWLOk3zcxqebSo2pzIB1xUnp2",
 * "state": "open",
 * "started_at": "2025-10-29T07:00:00-02:00",
 * "finished_at": "2025-10-29T07:00:00-08:00"
 * }
 * @param {*} res
 *
 * @returns
 * {
 * "message": "Turno creado correctamente",
 * "id": "shiftId"
 * }
 */
export async function createShift(req, res) {
  try {
    const { started_at, user_id, state, finished_at } = req.body || {};

    if (!user_id) {
      return res
        .status(406)
        .json({ error: "Se requiere user_id para crear un turno" });
    }

    const payload = {
      user_id,
      state: state || "open",
      started_at: started_at
        ? started_at instanceof Date
          ? admin.firestore.Timestamp.fromDate(started_at)
          : started_at
        : admin.firestore.FieldValue.serverTimestamp(),
      finished_at: finished_at
        ? finished_at instanceof Date
          ? admin.firestore.Timestamp.fromDate(finished_at)
          : finished_at
        : admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await db.collection("shifts").add(payload);
    if (payload.state === "open") await invalidateCache("shifts:all");

    const io = getIO();
    io.to("cash").emit("turnoCreado", { id: ref.id, ...payload });

    return res.status(201).json({
      message: "Turno creado correctamente",
      id: ref.id,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error al crear turno",
      details: err.message,
    });
  }
}

/**
 * Obtiene un turno por su ID
 * @param {*} req
 * @param {*} res
 *
 * @returns
 * {
 * "id": "shiftId",
 * "user_id": "RivCWLOk3zcxqebSo2pzIB1xUnp2",
 * "state": "open",
 * "started_at": "2025-10-29T07:00:00-02:00",
 * "finished_at": null,
 * "total_bills": 2,
 * "total_sales": 35600,
 * "products_summary": {
 *   "Cerveza Aguila": 1,
 *   "Empanada Pollo": 1,
 *   "Galletas de sal": 1,
 *   "Tea 250ml": 3,
 *   "Tinto": 5
 * }
 * }
 */
export async function getShiftById(req, res) {
  try {
    const { id } = req.params;

    const shift = await getOrSetCache(`shift:${id}`, async () => {
      const snap = await db.collection("shifts").doc(id).get();
      if (!snap.exists) return null;

      return { id, ...snap.data() };
    }, TTL_SHIFT_DETAIL);

    if (!shift) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    return res.json(shift);
  } catch (err) {
    return res.status(500).json({
      error: "Error al obtener turno",
      details: err.message,
    });
  }
}

/**
 * Actualiza un turno por su ID
 * @param {*} req
 * @param {*} res
 *
 * @returns
 * {
 * "message": "Turno actualizado correctamente"
 * }
 */
export async function updateShiftById(req, res) {
  try {
    const { id } = req.params;
    const { started_at, finished_at, state, user_id } = req.body || {};

    const ref = db.collection("shifts").doc(id);

    const update = {};
    if (typeof user_id === "string") update.user_id = user_id;
    if (typeof state === "string") update.state = state;
    if (started_at !== undefined) {
      update.started_at =
        started_at instanceof Date
          ? admin.firestore.Timestamp.fromDate(started_at)
          : started_at;
    }
    if (finished_at !== undefined) {
      update.finished_at =
        finished_at === null
          ? null
          : finished_at instanceof Date
            ? admin.firestore.Timestamp.fromDate(finished_at)
            : finished_at;
    }

    // Si el estado cambia a "closed" y no se proporciona finished_at, usar serverTimestamp
    if (update.state === "closed" && update.finished_at === undefined) {
      update.finished_at = admin.firestore.FieldValue.serverTimestamp();
    }

    try {
      await ref.update(update);
      await invalidateCache(`shift:${id}`);
      if (update.state) await invalidateCache("shifts:all");
    } catch (e) {
      if (e.code === 5) {
        return res.status(404).json({ error: "Turno no encontrado" });
      }
      return res.status(500).json({ error: "Error al actualizar turno", details: e.message });
    }

    const io = getIO();
    io.to("cash").emit("turnoActualizado", { id, data: update });

    return res.status(200).json({ message: "Turno actualizado correctamente" });
  } catch (err) {
    return res.status(500).json({
      error: "Error al actualizar turno",
      details: err.message,
    });
  }
}

/**
 * Elimina un turno por su ID
 * @param {*} req
 * @param {*} res
 *
 * @returns
 * {
 * "message": "Turno eliminado correctamente"
 * }
 */
export async function deleteShift(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Se requiere ID del turno" });

    const billsSnap = await db
      .collection("bills")
      .where("shift_id", "==", id)
      .limit(1)
      .get();
    if (!billsSnap.empty) {
      return res.status(400).json({
        error: "No se puede eliminar el turno: existen cuentas asociadas",
      });
    }

    await db.collection("shifts").doc(id).delete();
    await invalidateCache(`shift:${id}`);
    await invalidateCache("shifts:all");

    const io = getIO();
    io.to("cash").emit("turnoEliminado", { id });

    return res.status(200).json({ message: "Turno eliminado correctamente" });
  } catch (err) {
    return res.status(500).json({
      error: "Error al eliminar turno",
      details: err.message,
    });
  }
}
