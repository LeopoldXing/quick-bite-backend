import express, { Request, Response } from "express";
import cors from "cors";
import * as mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import myRestaurantRoute from "./routes/MyRestaurantRoute";

// 1. get env
require('dotenv').config();

// 2. connect to database
let connectionString = process.env.MONGODB_CONNECT_STRING;
if (!connectionString) {
  connectionString = `mongodb://${process.env.MONGODB_ROOT_USERNAME}:${process.env.MONGODB_ROOT_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/`
}
mongoose.connect(connectionString as string).then(() => console.log("Connected to database!"))

const app = express();
app.use(express.json());
app.use(cors());

// health check
app.get("/", async (req: Request, res: Response) => {
  res.send({ message: '200 ok' });
})

app.use("/api/my/user/", myUserRoute);
app.use("/api/my/restaurant", myRestaurantRoute);

app.listen(process.env.PORT || 80, () => console.log(`Server is running on port ${process.env.PORT || 80}.`));
