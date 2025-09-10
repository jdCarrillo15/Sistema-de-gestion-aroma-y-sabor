import { admin, db } from "../config/firebase.js";

export async function getUsers(req, res) {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Acceso denegado: Solo administradores" });
        }

        const listUsers = await admin.auth().listUsers(100);

        res.json(listUsers);
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo usuarios", details: err.message });
    }
}

export async function getUsersFromDB(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Acceso denegado: Solo administradores" });
        }

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

        // 1. Crear usuario en Firebase Auth
        const userRecord = await admin.auth().createUser({
            email: data.email,
            password: data.password
        });
        const authUid = userRecord.uid;

        //2. Agregar rol a CustomClaims
        await admin.auth().setCustomUserClaims(authUid, { role: data.role });

        // 3. crear el documento en "users"
        await db.collection("users").doc(authUid).set({
            user_name: data.user_name,
            role: data.role,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // 4. Crear documento en "persons" 
        await db.collection("persons").add({
            address: data.address,
            birthdate: data.birthdate,
            document_id: data.document_id,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            phone_number: data.phone_number,
            user_id: authUid,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({
            message: "Usuario registrado correctamente",
            userId: authUid
        });
    } catch (error) {
        res.status(500).json({
            error: "Error al crear el usuario",
            details: error.message
        });
    }
}

