import express, {Request, Response} from "express";
import cors from "cors";
import * as mongoose from "mongoose";

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

app.get("/test", async (request: Request, response: Response) => {
  response.json({msg: "Hello!"})
})

app.listen(3005, () => console.log("Server is running on port 3005."));
