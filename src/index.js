import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";

import userRoutes from "./modules/users/user.routes.js";
import messageRoutes from "./modules/messages/message.routes.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import { connectDB } from "./DB/connection.js";

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/messages", messageRoutes);


app.use(globalErrorHandler);

// Connect to DB 
connectDB().then(() => {
  app.listen(port, () =>
    console.log(`🚀 Server running on http://localhost:${port}`)
  );
});
