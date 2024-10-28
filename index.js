import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";

dotenv.config({});

const app = express();

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "i am coming from backend",
    success: true,
  });
});

//middleware

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

//yaha par api  call karna hai

app.use("/api/v1/user", userRoute);
("http://localhost:8000/api/v1/user");

app.listen(port, () => {
  connectDB();
  console.log(`server listening at port : ${port}`);
});
