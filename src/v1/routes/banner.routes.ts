import express from "express";
import { creatBanner, deletBanner, getBanner, getBannerById, updatBanner } from "v1/controllers/banner.controller";

const router = express.Router();

router.post("/", creatBanner);
router.get("/", getBanner);
router.get("/getById/:id", getBannerById);
router.patch("/updateById/:id", updatBanner);
router.delete("/deleteById/:id", deletBanner);

export default router;
