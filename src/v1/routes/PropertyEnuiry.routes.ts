import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  addPropertyEnuiry,
  deletePropertyEnuiryById,
  getAllPropertyEnuiry,
  getPropertyEnuiryById,
  updatePropertyEnuiryById,
} from "../controllers/PropertyEnuiry.controller";
const router = express.Router();
router.post("/", authorizeJwt, addPropertyEnuiry);
router.get("/", authorizeJwt, getAllPropertyEnuiry);
router.get("/getById/:id", authorizeJwt, getPropertyEnuiryById);
router.patch("/updateById/:id", authorizeJwt, updatePropertyEnuiryById);
router.delete("/deleteById/:id", authorizeJwt, deletePropertyEnuiryById);
export default router;
