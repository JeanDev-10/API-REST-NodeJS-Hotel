import jwt from "jsonwebtoken";
import { TOKEN_KEY } from "../config/config.js";

export const verifyToken = (req, res, next) => {
  const tokenHeader = req.header('Authorization');

  if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = tokenHeader.split(' ')[1];

  jwt.verify(token, TOKEN_KEY, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user_id = user.user_id;
    req.role_id=user.role_id
    next();
  });
};