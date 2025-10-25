import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  addLoyaltyQuery,
  deleteLoyaltyQueryById,
  getAllLoyaltyQuery,
  getLoyaltyQueryById,
  updateLoyaltyQueryById,
} from "../controllers/LoyaltyQuery.controller";
const router = express.Router();
router.post("/", addLoyaltyQuery);
router.get("/", authorizeJwt, getAllLoyaltyQuery);
router.get("/getById/:id", authorizeJwt, getLoyaltyQueryById);
router.patch("/updateById/:id", authorizeJwt, updateLoyaltyQueryById);
router.delete("/deleteById/:id", authorizeJwt, deleteLoyaltyQueryById);
export default router;
