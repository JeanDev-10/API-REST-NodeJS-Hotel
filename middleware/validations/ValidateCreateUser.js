import { check, validationResult } from "express-validator";

export const ValidateCreateUser = [
  check("name").notEmpty().withMessage("Name is required"),
  check("lastname").notEmpty().withMessage("Lastname is required"),
  check("email").isEmail().withMessage("Invalid email format"),
  check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }
];
