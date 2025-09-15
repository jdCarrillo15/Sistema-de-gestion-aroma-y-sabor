import { db } from "../config/firebase.js";

export async function getResourceDoc(id, collection) {
    const resourceDoc = await db.collection(collection).doc(id).get();

    return resourceDoc.data() || null;
}