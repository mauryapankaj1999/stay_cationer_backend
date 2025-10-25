import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  addEnquiry,
  deleteEnquiryById,
  getAllEnquiry,
  getEnquiryById,
  updateEnquiryById,
} from "../controllers/enquiry.controller";
const router = express.Router();
router.post("/", addEnquiry);
router.get("/", getAllEnquiry);
router.get("/getById/:id", getEnquiryById);
router.patch("/updateById/:id", updateEnquiryById);
router.delete("/deleteById/:id", deleteEnquiryById);
export default router;
