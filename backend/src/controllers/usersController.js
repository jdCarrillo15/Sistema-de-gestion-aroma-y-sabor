import { admin, db } from "../config/firebase.js";

export async function getUsers(req, res) {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied: Admins only" });
        }

        const listUsers = await admin.auth().listUsers(100);


        res.json(listUsers);
    } catch (err) {
        res.status(500).json({ error: "Error fetching users", details: err.message });
    }
}

export async function getUsersFromDB(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied: Admins only" });
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
        console.error("Error fetching users from DB:", err.message);
        res.status(500).json({ error: "Error fetching users", details: err.message });
    }
}

