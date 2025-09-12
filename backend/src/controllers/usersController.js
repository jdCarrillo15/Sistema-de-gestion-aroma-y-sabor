import { admin, db } from "../config/firebase.js";

export async function getUsers(req, res) {
    try {
        const listUsers = await admin.auth().listUsers(100);

        res.json(listUsers);
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo usuarios", details: err.message });
    }
}

export async function getUsersFromDB(req, res) {
    try {
        const snapshot = await db.collection("users").get();

        if (snapshot.empty) {
            return res.json({ users: [] });
        }

        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo usuarios", details: err.message });
    }
}

export async function createUserAndPerson(req, res) {
    try {
        const data = req.body;

        if (!data.email || !data.password) {
            return res.status(400).json({ error: "Email y password son obligatorios" });
        }

        // 1. Crear usuario en Firebase Auth
        const userRecord = await admin.auth().createUser({
            email: data.email,
            password: data.password
        });
        const authUid = userRecord.uid;

        // 2. Crear documento en "users"
        await db.collection("users").doc(authUid).set({
            user_name: data.user_name || "",
            role: data.role || "user",
            email: data.email,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // 3. Crear documento en "persons"
        await db.collection("persons").add({
            birthdate: data.birthdate || "",
            document_id: data.document_id || "",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            user_id: authUid,
        });

        res.status(201).json({
            message: "Usuario creado correctamente",
            userId: authUid
        });
    } catch (error) {
        res.status(500).json({
            error: "Error al crear el usuario",
            details: error.message
        });
    }
}



