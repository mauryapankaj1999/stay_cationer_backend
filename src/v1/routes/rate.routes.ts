import express from "express";
import { creatRate, deletRate, getRate, getRateById, roomAvailablity, updatRate } from "v1/controllers/rate.controller";

const router = express.Router();

router.post("/", creatRate);
router.get("/", getRate);
router.get("/getById/:id", getRateById);
router.patch("/updateById/:id", updatRate);
router.patch("/roomAvailables/:id", roomAvailablity);
router.delete("/deleteById/:id", deletRate);

export default router;
