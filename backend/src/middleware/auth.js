import { admin } from "../config/firebase.js";

export async function checkAuth(req, res, next) {
    const sessionCookie = req.cookies.session || "";
    try {
        const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
        req.user = decodedClaims;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Acceso no autorizado" });
    }
}
