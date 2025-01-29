
export const verifyIsAdmin = (req, res, next) => {
  if (req.role_id === 1) {
    next();
  }
  return res.status(403).json({ message: 'No autorizado' });
};
export const verifyIsClient = (req, res, next) => {
  if (req.role_id === 2) {
    next();
  }
  return res.status(403).json({ message: 'No autorizado' });
};
