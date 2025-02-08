import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from 'url';

// Obtener la ruta absoluta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resuelve la ruta correcta al archivo de claves de servicio
const serviceAccount = path.resolve(__dirname, "serviceAcoountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
