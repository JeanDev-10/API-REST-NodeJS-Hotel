import { body, validationResult } from "express-validator";

export const ValidateCreateReservation = [
  // Validar campos obligatorios
  body("date_start")
    .notEmpty()
    .withMessage("La fecha de inicio es obligatoria")
    .isISO8601()
    .withMessage("La fecha de inicio debe tener un formato válido (YYYY-MM-DD)"),
  body("date_end")
    .notEmpty()
    .withMessage("La fecha de fin es obligatoria")
    .isISO8601()
    .withMessage("La fecha de fin debe tener un formato válido (YYYY-MM-DD)"),
  body("room_id")
    .notEmpty()
    .withMessage("El ID de la habitación es obligatorio")
    .isInt()
    .withMessage("El ID de la habitación debe ser un número entero"),

  // Validar fechas
  body("date_start").custom((value, { req }) => {
    const dateStart = new Date(value);
    const currentDate = new Date();

    if (dateStart < currentDate) {
      throw new Error("La fecha de inicio no puede ser inferior a la fecha actual");
    }
    return true;
  }),
  body("date_end").custom((value, { req }) => {
    const dateStart = new Date(req.body.date_start);
    const dateEnd = new Date(value);

    if (dateEnd < dateStart) {
      throw new Error("La fecha de fin no puede ser menor a la fecha de inicio");
    }


     // Validar que la reservación sea de al menos 1 día
     if (dateStart.toISOString().split('T')[0] === dateEnd.toISOString().split('T')[0]) {
        throw new Error("La reservación debe ser de al menos 1 día (las fechas de inicio y fin no pueden ser iguales)");
      }
    return true;
  }),

  // Manejar errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];