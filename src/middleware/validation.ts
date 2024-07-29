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

export const validateMyRestaurantRequest = [
  body("restaurantName").isString().notEmpty().withMessage("Restaurant name is required"),
  body("city").isString().notEmpty().withMessage("City is required"),
  body("country").isString().notEmpty().withMessage("Country is required"),
  body("deliveryPrice").isFloat({ min: 0 }).withMessage("DeliveryPrice must be a positive number"),
  body("estimatedDeliveryTime").isInt({ min: 0 }).withMessage("Estimated DeliveryTime must be a positive number"),
  body("cuisines").isArray().withMessage("Cuisines must be an array").not().isEmpty().withMessage("Cuisine can't be empty"),
  body("menuItems").isArray().withMessage("MenuItem must be an array"),
  body("menuItem.*.name").notEmpty().withMessage("MenuItem name can't be empty"),
  body("menuItem.*.price").isFloat({ min: 0 }).withMessage("MenuItem price must be a positive number"),
  handleValidationErrors
]
