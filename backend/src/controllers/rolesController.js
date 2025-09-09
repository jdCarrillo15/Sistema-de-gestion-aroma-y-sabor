import { admin } from "../config/firebase.js";

export async function assignRole(req, res) {
    const { uid, rol } = req.body;

    if (!req.user || req.user.rol !== "admin") {
        return res.status(403).json({ error: "No autorizado para asignar roles" });
    }

    try {
        await admin.auth().setCustomUserClaims(uid, { rol });
        res.json({ message: `Rol '${rol}' asignado al usuario ${uid}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
