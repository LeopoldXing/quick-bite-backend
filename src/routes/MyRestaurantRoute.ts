import express from "express";
import MyRestaurantController from "../controllers/MyRestaurantController";
import { validateMyRestaurantRequest } from "../middleware/validation";

const router = express.Router();

router.post('/', validateMyRestaurantRequest, MyRestaurantController.createMyRestaurant);

export default router;
