import { body, validationResult } from "express-validator";
import { RoomModel } from "../../models/Rooms.model.js";

export const ValidateCreateRoom = [
  body("name").notEmpty().withMessage("El nombre es obligatorio")
  .custom(async (value) => {
    const existingRoom = await RoomModel.findOne({ where: { name: value } });
    if (existingRoom) {
      throw new Error("El nombre de la habitación ya está en uso");
    }
    return true;
  }),
  body("description").notEmpty().withMessage("La descripción es obligatoria"),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("El precio debe ser un número mayor a 0"),
  body("type_id").isInt().withMessage("El tipo de habitación es obligatorio"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];
