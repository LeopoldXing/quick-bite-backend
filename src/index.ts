import express from "express";
import cors from "cors";
import * as mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";

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

app.use("/api/my/user", myUserRoute)

app.listen(3005, () => console.log("Server is running on port 3005."));
