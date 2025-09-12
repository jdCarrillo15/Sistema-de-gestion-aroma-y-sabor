import { admin, db } from "../config/firebase.js";

//Autenticar con token (sin cookie)
export async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Se debe proveer un token" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userDoc = await db.collection("users").doc(decodedToken.uid).get();

        const userData = userDoc.data();

        req.user = {
            uid: decodedToken.uid,
            role: userData?.role || "user",
            email: userData?.email || ""
        };

        next();
    } catch (error) {
        console.error("Error verificando el token:", error.message);
        return res.status(401).json({ error: "Token invalido" });
    }
}

export async function checkAuth(req, res, next) {
    const sessionCookie = req.cookies.session || "";
    try {
        const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
        req.user = decodedClaims;

        const userDoc = await db.collection("users").doc(decodedToken.uid).get();
        const userData = userDoc.data();

        req.user = {
            uid: decodedToken.uid,
            role: userData?.role || "user",
            email: userData?.email || ""
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: "Acceso no autorizado" });
    }
}

//Autorizar una acción sobre un solo recurso (colección de base de datos)
export function authorize(resource, action) {
    return async (req, res, next) => {
        try {
            const userRole = await db.collection("roles").doc(req.user.role).get();
            const permissions = userRole.data();
            const allowed = permissions[resource]?.includes(action);

            if (!allowed) {
                return res.status(403).json({ error: "Acceso denegado" });
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
            if (!userRole.exists) {
                return res.status(403).json({ error: "Rol no configurado" });
            }

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