import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  addHomeLogs,
  deleteHomeLogsById,
  getAllHomeLogs,
  getHomeLogsById,
  updateHomeLogsById,
} from "../controllers/HomeLog.controller";
const router = express.Router();
router.post("/", authorizeJwt, addHomeLogs);
router.get("/", authorizeJwt, getAllHomeLogs);
router.get("/getById/:id", authorizeJwt, getHomeLogsById);
router.patch("/updateById/:id", authorizeJwt, updateHomeLogsById);
router.delete("/deleteById/:id", authorizeJwt, deleteHomeLogsById);
export default router;
