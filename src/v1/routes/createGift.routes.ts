import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  addData,
  deleteById,
  getAllData,
  getById,
  updateById,
} from "../controllers/createGift.controller";
const router = express.Router();
router.post("/", addData);
router.get("/", authorizeJwt, getAllData);
router.get("/getById/:id", authorizeJwt, getById);
router.patch("/updateById/:id", authorizeJwt, updateById);
router.delete("/deleteById/:id", authorizeJwt, deleteById);
export default router;
