import { body, validationResult } from "express-validator";

export const ValidateCreateReservation = [
  // Validar campos obligatorios
 
  body("date_start")
    .notEmpty()
    .withMessage("La fecha de inicio es obligatoria")
    .matches(/^\d{4}-\d{2}-\d{2}/) // Extrae solo la parte YYYY-MM-DD
    .withMessage(
      "La fecha de inicio debe tener un formato válido (YYYY-MM-DD)"
    ),

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

  // Validar y normalizar fechas
  body("date_start").custom((value, { req }) => {
    let dateStart = new Date(value.split("T")[0]); // Extrae solo la parte de la fecha
    let currentDate = new Date();
    let currentUTC = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
    if (dateStart < currentUTC) {
      throw new Error("La fecha de inicio no puede ser inferior a la fecha actual");
    }
    return true;
  }),
  body("date_end").custom((value, { req }) => {
    let dateStart = new Date(req.body.date_start);
    let dateEnd = new Date(value);
    if (dateEnd <= dateStart) {
      throw new Error("La fecha de fin debe ser mayor a la fecha de inicio");
    }
    dateStart.setHours(0, 0, 0, 0);
    dateEnd.setHours(0, 0, 0, 0);
    if (dateEnd <= dateStart) {
      throw new Error("La reservación debe ser de al menos 1 día");
    }
    // Validar que la diferencia entre las fechas sea de al menos 1 día
    const oneDayInMs = 24 * 60 * 60 * 1000; // Milisegundos en un día
    if (dateEnd.getTime() - dateStart.getTime() < oneDayInMs) {
      throw new Error("La reservación debe ser de al menos 1 día");
    }
    return true;
  }),

  // Manejar errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];
