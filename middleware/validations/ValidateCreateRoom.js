import { body, validationResult } from "express-validator";

export const ValidateCreateRoom = [
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("description").notEmpty().withMessage("La descripción es obligatoria"),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("El precio debe ser un número mayor a 0"),
  body("type_id").isInt().withMessage("El tipo de habitación es obligatorio"),
  (req, res, next) => {
    console.log("Files recibidos:", req.files); // Verifica si las imágenes llegan

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
