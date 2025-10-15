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
                    state: data.state,
                    person,
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
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
    const data = req.body;
    if (!data.email || !data.password) {
        return res.status(406).json({ error: "Email y password son obligatorios" });
    }
    if ((await checkEmailUnique(data.email)) == false) {
        return res.status(409).json({ error: "El email ya está en uso" });
    }
    if (data.password.length < 6) {
        return res.status(406).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    } else if (await checkPasswordStrength(data.password) == false) {
        return res.status(406).json({ error: "La contraseña debe contener al menos una mayúscula, una minúscula y un número" });
    }
    try {
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
            role: data.role || "",
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

//Verificar correo unico 
export async function checkEmailUnique(email) {
    const userQuery = await db.collection("users").where("email", "==", email).get();
    try {
        await admin.auth().getUserByEmail(email);
        return false; // El email ya existe en Auth
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return true; // El email es único en Auth
        } else return userQuery.empty; // true si el email es único
    }
}
//Verificar robustes de contraseña
export function checkPasswordStrength(password) {
    // Al menos 6 caracteres, una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
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
            state: userDoc.state,
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

export async function changeStateUser(req, res) {
    try {
        const userDoc = await db.collection("users").doc(req.params.id).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const data = req.body;

        await db.collection("users").doc(req.params.id).update(data);
        res.status(200).json({ message: "Usuario actualizado correctamente" });
    } catch (error) {

    }
}
export async function hardDeleteUser(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Se requiere el ID del usuario" });
        }

        if (admin.auth().currentUser && admin.auth().currentUser.uid === id) {
            return res.status(403).json({ error: "No se puede eliminar el usuario autenticado" });
        }
        if ((await checkUserExists(id)) == false) {
            return res.status(404).json({ error: "Usuario no encontrado" });
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
        } else {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario y datos relacionados eliminados correctamente" });
    } catch (err) {
        res.status(500).json({
            error: "Error al eliminar usuario",
            details: err.message
        });
    }
}

//Verificar si el usuario existe en Auth
export async function checkUserExists(uid) {
    try {
        await admin.auth().getUser(uid);
        return true; // El usuario existe en Auth
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return false; // El usuario no existe en Auth
        } else {
            throw error; // Otro error
        }
    }
}





