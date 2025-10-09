import { admin, db } from "../config/firebase.js";
import { canAccess } from "../services/authService.js";

export async function authenticate(req, res, next) {
    const sessionCookie = req.cookies.session || "";
    try {
        const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);

        const userDoc = await db.collection("users").doc(decodedClaims.uid).get();
        const userData = userDoc.data();

        req.user = {
            uid: decodedClaims.uid,
            role: userData?.role || "user",
            email: userData?.email || ""
        };

        next();
    } catch (error) {
        return res.status(401).json({ error: "Acceso no autorizado" });
    }
}

//Autorizar una acción sobre un solo recurso (colección de base de datos)
export function authorize(action, resource) {
    return async (req, res, next) => {
        try {
            const currentState = req.state || null;
            const hasAccess = await canAccess(req.user, action, resource, currentState, req.params.id);

            if (!hasAccess) {
                return res.status(403).json({
                    error: `Acceso denegado: rol "${req.user.role}" no puede "${action}" en "${resource}" (estado: ${currentState})`
                });
            }
            next();
        } catch (err) {
            res.status(500).json({ error: "Error en autorización", details: err.message });
        }
    };
}

//Autorizar una acción sobre varios recursos en la base de datos
export function authorizeComposite(action) {
    return async (req, res, next) => {
        try {
            const userRole = await db.collection("roles").doc(req.user.role).get();
            const permissions = userRole.data();
            // Buscar en recursos compuestos
            const allowed = permissions.composite?.includes(action);
            if (!allowed) {
                return res.status(403).json({ error: "Acceso denegado" });
            }
            next();
        } catch (err) {
            res.status(500).json({ error: "Error de autorización", details: err.message });
        }
    };
}

// Middleware para cargar el estado de un recurso si es necesario un estado específico
export function loadResourceState(resourceCollection, idParam = "id") {
    return async (req, res, next) => {
        try {
            const docId = req.params[idParam];
            const doc = await db.collection(resourceCollection).doc(docId).get();
            const data = doc.data();
            req.state = data.state || null;

            next();
        } catch (err) {
            res.status(500).json({ error: "Error obteniendo estado del recurso" });
        }
    };
}
