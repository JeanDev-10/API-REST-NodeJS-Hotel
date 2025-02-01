import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    { user_id: user.id, email: user.email, role_id: user.role_id }, // Payload del token
    "secretToken", // Clave secreta
    { expiresIn: "1h" } // Tiempo de expiración
  );
};