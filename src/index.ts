import express, {Request, Response} from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/test", async (request: Request, response: Response) => {
  response.json({msg: "Hello!"})
})

app.listen(3005, () => console.log("Server is running on port 3005."));
