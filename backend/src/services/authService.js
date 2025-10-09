import { db } from "../config/firebase.js";

export async function canAccess(user, action, resource, currentState, resourceOwnerId = null) {
    const doc = await db.collection("policies").doc(user.role).get();

    const policies = doc.exists ? doc.data() : null;
    if (!policies || !policies[resource]?.[action]) return false;

    const allowedStates = policies[resource][action];

    if (allowedStates.includes("*")) return true; // *: Siempre permitido

    // "own": acceso solo a su propia información
    if (allowedStates.includes("own") && resourceOwnerId === user.uid) return true;

    // Validar si puede realizar la acción con el estado actual del recurso
    return allowedStates.includes(currentState);

}
