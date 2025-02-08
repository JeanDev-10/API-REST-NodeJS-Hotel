// ValidateFirebaseToken.js
import admin from 'firebase-admin';

export const ValidateFirebaseToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    req.firebaseUser = await admin.auth().verifyIdToken(idToken);
    next();
  } catch (error) {
    res.status(401).json({ message: "Token de Google inválido" });
  }
};