import multer from "multer";

const storage = multer.memoryStorage(); // Guardar imágenes en memoria para Cloudinary

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por imagen
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se permiten imágenes"), false);
    }
    cb(null, true);
  },
}).fields([
  { name: "images", maxCount: 5 }, // Hasta 5 imágenes
]);

export const uploadValidateImages = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.files || !req.files.images || req.files.images.length === 0) {
        return res.status(400).json({ message: "Se debe subir al menos una imagen" });
      }
    next();
  });
};
