import express, { Request, Response } from "express";
import cors from "cors";
import * as mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import myRestaurantRoute from "./routes/MyRestaurantRoute";
import { v2 as cloudinary } from "cloudinary";
import RestaurantRoute from "./routes/RestaurantRoute";
import OrderRoute from "./routes/OrderRoute";

// 1. get env
require('dotenv').config();

// 2. connect to database
let connectionString = process.env.MONGODB_CONNECT_STRING;
if (!connectionString) {
  connectionString = `mongodb://${process.env.MONGODB_ROOT_USERNAME}:${process.env.MONGODB_ROOT_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/`
}
mongoose.connect(connectionString as string).then(() => console.log("Connected to database!"))

// 3. cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express();
app.use(express.json());
app.use(cors());

// health check
app.get("/", async (req: Request, res: Response) => {
  res.send({ message: '200 OK' });
})

app.use("/api/my/user/", myUserRoute);
app.use("/api/my/restaurant", myRestaurantRoute);
app.use("/api/restaurant", RestaurantRoute);
app.use("/api/order", OrderRoute);

app.listen(process.env.BACKEND_PORT || 8080, () => console.log(`Server is running on port ${process.env.BACKEND_PORT || 8080}.`));
