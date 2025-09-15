import { admin, db } from "../config/firebase.js";
import { getResourceDoc } from "../services/resourceService.js";

export async function getUsers(req, res) {
    try {
        const user = await db.collection("users").get();

        if (user.empty) {
            return res.json({ users: [] });
        }

        const users = await Promise.all(
            user.docs.map(async doc => {
                const data = doc.data();
                let person = null;

                if (data.person_id) {// Obtiene los datos de persona de cada usuario
                    const personDoc = await db.collection("persons").doc(data.person_id).get();
                    if (personDoc.exists) {
                        person = { id: personDoc.id, ...personDoc.data() };
                    }
                }

                return {
                    id: doc.id,
                    user_name: data.user_name,
                    email: data.email,
                    role: data.role,
                    person,
                    created_at: new Date(data.created_at._seconds * 1000).toISOString(),
                };
            })
        );

        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo usuarios", details: err.message });
    }
}

//CRUD functions
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

        // 2. Crear documento en "persons"
        const person = await db.collection("persons").add({
            birthdate: data.birthdate || "",
            document_id: data.document_id || "",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
        });

        const personId = person.id;

        // 3. Crear documento en "users"
        await db.collection("users").doc(authUid).set({
            person_id: personId,
            user_name: data.user_name || "",
            role: data.role || "user",
            email: data.email,
            state: data.state || "active",
            created_at: admin.firestore.FieldValue.serverTimestamp()
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

export async function getUserById(req, res) {
    try {
        const { id } = req.params
        const userDoc = await getResourceDoc(id, "users");

        if (!userDoc) return res.status(403).json({ error: "Usuario no encontrado" });

        let person = null;

        if (userDoc.person_id) {// Obtener datos de persona correspondiente a ese usuario
            const personDoc = await getResourceDoc(userDoc.person_id, "persons");
            if (personDoc) {
                person = { id: personDoc.id, ...personDoc };
            }
        }

        return res.json({
            id: userDoc.id,
            user_name: userDoc.user_name,
            email: userDoc.email,
            role: userDoc.role,
            person,
            created_at: new Date(userDoc.created_at._seconds * 1000).toISOString()
        });
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo usuario", details: err.message });
    }
}

export async function updateUserById(req, res) {
    try {
        const userDoc = await db.collection("users").doc(req.params.id).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const data = req.body;

        if (data.email) {//Se actualiza el email de auth antes de actualizar en la BD
            await admin.auth().updateUser(req.params.id, { email: data.email });
        }

        await db.collection("users").doc(req.params.id).update(data);
        res.status(200).json({ message: "Usuario actualizado correctamente" });

    } catch (err) {
        res.status(500).json({ error: "Error al actualizar usuario", details: err.message })
    }
}

export async function hardDeleteUser(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Se requiere el ID del usuario" });
        }

        // 1. Eliminar usuario de Firebase Auth
        await admin.auth().deleteUser(id);

        // 2. Eliminar documento en "users"
        const userRef = db.collection("users").doc(id);
        const userSnap = await userRef.get();

        if (userSnap.exists) {
            const userData = userSnap.data();

            // 3. Si existe person_id, eliminar el documento en "persons"
            if (userData.person_id) {
                const personRef = db.collection("persons").doc(userData.person_id);
                await personRef.delete();
            }

            // Eliminar el doc de users
            await userRef.delete();
        }

        res.json({ message: "Usuario y datos relacionados eliminados correctamente" });
    } catch (err) {
        console.error("Error al eliminar usuario:", err);
        res.status(500).json({
            error: "Error al eliminar usuario",
            details: err.message
        });
    }
}





