import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import { DashboardMetrices, getOrdersData, totalCounts } from "v1/controllers/dashbnoard.controller";
const router = express.Router();

router.get("/counts", authorizeJwt, totalCounts);
router.get("/getOrdersData", authorizeJwt, getOrdersData);
router.get("/dashboard", authorizeJwt, DashboardMetrices);

export default router;
