import express from "express";
import {
  createCoupon,
  getCoupon,
  getCouponById,
  deleteCoupon,
  updateCoupon,
  checkValidCoupon,
  getPropertyForCoupon,
} from "v1/controllers/coupon.controller";

const router = express.Router();

router.post("/", createCoupon);
router.get("/", getCoupon);
router.get("/getById/:id", getCouponById);
router.patch("/updateById/:id", updateCoupon);
router.delete("/deleteById/:id", deleteCoupon);
router.post("/checkValidCoupon", checkValidCoupon)
router.get("/getPropetyForCoupon", getPropertyForCoupon);

export default router;
