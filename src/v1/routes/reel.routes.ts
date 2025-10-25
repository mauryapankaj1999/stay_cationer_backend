import express from "express";
import { creatReel, deletReel, getReel, getReelById, updatReel } from "v1/controllers/reel.controller";

const router = express.Router();

router.post("/", creatReel);
router.get("/", getReel);
router.get("/getById/:id", getReelById);
router.patch("/updateById/:id", updatReel);
router.delete("/deleteById/:id", deletReel);

export default router;
