import { check, validationResult } from "express-validator";

export const ValidateChangePasswordUser = [
  check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  check("newPassword").isLength({ min: 6 }).withMessage("New Password must be at least 6 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];
