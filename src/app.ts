import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { CONFIG } from "common/config.common";
import mongoose from "mongoose";
import { errorHandler } from "./middlewares/errorHandler.middleware";

const app = express();

import v1Router from "./v1/router.v1";
import { adminSeeder } from "seeder/adminSeeder";
import { setUserAndUserObj } from "middlewares/auth.middleware";
import { seedData } from "seeder/seeder";

mongoose
  .connect(CONFIG.MONGOURI)
  .then(() => console.log("DB Connected to ", CONFIG.MONGOURI))
  .catch((err) => console.error(err));

mongoose.set("debug", false);

app.use(cors());
app.set("trust proxy", true);
app.use(setUserAndUserObj);
app.use(logger("dev"));
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: false, limit: "500mb" }));
app.use(cookieParser());

app.use(express.static(path.join(process.cwd(), "public")));

seedData();

app.use("/v1", v1Router);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(errorHandler);

export default app;
