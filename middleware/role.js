import { UserModel } from "../models/UserModel.js";

const verifyRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // Suponiendo que req.user_id y req.role_id están correctamente establecidos por el middleware de token
      if (!req.user_id) {
        return res.status(400).json({ message: 'User ID missing' });
      }

      const user = await UserModel.findByPk(req.user_id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role_id === requiredRole) {
        return next();
      }

      return res.status(403).json({ message: 'No autorizado' });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Middleware para verificar si es admin
export const verifyIsAdmin = verifyRole(1);

// Middleware para verificar si es cliente
export const verifyIsClient = verifyRole(2);
