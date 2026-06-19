import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Server Running");
});

app.use("/api/v1/users", userRoutes);

app.use(errorHandler);

export default app;