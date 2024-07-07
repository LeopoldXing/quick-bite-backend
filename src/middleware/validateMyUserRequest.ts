import { body, validationResult } from "express-validator";
import express, { NextFunction } from "express";

const handleValidationErrors = async (req: express.Request, res: express.Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).send({ errors: errors.array() });
  }
  next();
}

export const validateMyUserRequest = [
  body("name").isString().notEmpty().withMessage("Name must be a string"),
  body("email").isString().notEmpty().withMessage("Email must be a string"),
  body("addressLine1").isString().notEmpty().withMessage("AddressLine1 must be a string"),
  body("city").isString().notEmpty().withMessage("City must be a string"),
  body("country").isString().notEmpty().withMessage("Country must be a string"),
  handleValidationErrors
]
