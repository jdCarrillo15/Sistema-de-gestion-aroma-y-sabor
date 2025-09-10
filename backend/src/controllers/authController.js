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