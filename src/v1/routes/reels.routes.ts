import express from "express";
import {
  createReels,
  getReels,
  getReelsById,
  deleteReels,
  updateReels,
  //   checkValidReels
} from "v1/controllers/reels.controller";

const router = express.Router();

router.post("/", createReels);
router.get("/", getReels);
router.get("/getById/:id", getReelsById);
router.patch("/updateById/:id", updateReels);
router.delete("/deleteById/:id", deleteReels);
// router.post("/checkValidReels", checkValidReels)

export default router;
