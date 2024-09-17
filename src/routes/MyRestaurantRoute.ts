import express from "express";
import MyRestaurantController from "../controllers/MyRestaurantController";
import { validateMyRestaurantRequest } from "../middleware/validation";
import multer from "multer";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

router.post('/', jwtCheck, jwtParse, upload.single("imageFile"), validateMyRestaurantRequest, MyRestaurantController.createMyRestaurant);
router.get('/', jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant);

export default router;
