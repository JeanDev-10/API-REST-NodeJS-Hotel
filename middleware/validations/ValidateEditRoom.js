import { body, validationResult } from "express-validator";

export const validateUpdateRoom = [
  body("name").optional().notEmpty().withMessage("El nombre es obligatorio"),
  body("description").optional().notEmpty().withMessage("La descripción es obligatoria"),
  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("El precio debe ser un número mayor a 0"),
  body("type_id").optional().isInt().withMessage("El tipo de habitación es obligatorio"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];