import express from "express";
import { creatReview, deletReview, getReview, getReviewById, updatReview } from "v1/controllers/review.controller";

const router = express.Router();

router.post("/", creatReview);
router.get("/", getReview);
router.get("/getById/:id", getReviewById);
router.patch("/updateById/:id", updatReview);
router.delete("/deleteById/:id", deletReview);

export default router;
