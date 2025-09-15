import { db, admin } from "../config/firebase.js";

export async function login(req, res) {
    const { email, password } = req.body;
    const expiresIn = 3600000; // 1 dia

    if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña requeridos" });
    }

    try {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, returnSecureToken: true })
            }
        );

        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        const sessionCookie = await admin.auth().createSessionCookie(data.idToken, { expiresIn });

        res.cookie("session", sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: false, // true en producción con HTTPS
            sameSite: "lax"
        });

        const userDoc = await db.collection("users").doc(data.localId).get();
        const role = userDoc.exists ? userDoc.data().role : "user";

        res.json({ success: true, uid: data.localId, role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error al iniciar sesión" });
    }
};

export async function logout(req, res) {
    res.clearCookie("session");
    res.json({ message: "Sesión cerrada" });
};

export async function resetPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "El correo es obligatorio" });
        }

        const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.FIREBASE_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                requestType: "PASSWORD_RESET",
                email: email,
            }),
        });

        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        return res.status(200).json({
            success: true,
            message: "Correo de recuperación enviado correctamente",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: "Error interno del servidor"
        });
    }
}