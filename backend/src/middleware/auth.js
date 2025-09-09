import { admin } from "../config/firebase.js";

export async function checkAuth(req, res, next) {
    //await admin.auth().setCustomUserClaims("89VJMJl6fkgpTGdcSXrXJ7b4yhW2", { role: "admin" });
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Error verifying token:", error.message);
        return res.status(401).json({ error: "Invalid token" });
    }
}



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

        res.cookie("token", data.idToken, {
            maxAge: expiresIn,
            httpOnly: true, // no accesible desde JS
            secure: true,   // solo por HTTPS
            sameSite: "strict"
        });

        res.json({ message: "Login exitoso", uid: data.localId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
};

export async function logout(req, res) {
    res.clearCookie("session");
    res.json({ message: "Sesión cerrada" });
};


