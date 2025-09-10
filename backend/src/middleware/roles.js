export function requireRole(requiredRole) {
    return (req, res, next) => {
        if (req.user?.role !== requiredRole) {
            return res.status(403).json({ error: `Se requiere rol ${requiredRole}` });
        }
        next();
    };
}

/* export function verifyTokenAndRole(requiredRole) {
  return async (req, res, next) => {
    try {
      // 1. Verificar token
      const idToken = req.headers.authorization?.split("Bearer ")[1];
      if (!idToken) {
        return res.status(401).json({ error: "Token requerido" });
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken; 

      // 2. Verificar rol
      if (requiredRole && req.user?.role !== requiredRole) {
        return res.status(403).json({ error: `Se requiere rol ${requiredRole}` });
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: "Token inválido", details: error.message });
    }
  };
}
 */