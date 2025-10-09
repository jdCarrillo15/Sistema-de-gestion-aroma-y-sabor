export function requireRole(requiredRole) {
  return (req, res, next) => {
    if (req.user?.role !== requiredRole) {
      return res.status(403).json({ error: `Se requiere rol ${requiredRole}` });
    }
    next();
  };
}

export function checkRoleWithAuth(requiredRole) {
  return async (req, res, next) => {
    const sessionCookie = req.cookies.session || "";

    try {
      // Verificar cookie de sesión
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      req.user = decodedClaims; 

      // Verificar rol
      if (req.user?.role !== requiredRole) {
        return res.status(403).json({
          error: `Acceso denegado. Se requiere rol ${requiredRole}`,
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: "Acceso no autorizado" });
    }
  };
}
