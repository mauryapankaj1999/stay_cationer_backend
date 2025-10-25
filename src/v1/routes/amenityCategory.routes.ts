import express from "express";
import {
  createAmenityCategory,
  getAmenityCategory,
  getAmenityCategoryById,
    deleteAmenityCategory,
  updateAmenityCategory
} from "v1/controllers/amenityCategory.controller";

const router = express.Router();

router.post("/", createAmenityCategory);
router.get("/", getAmenityCategory);
router.get("/getById/:id", getAmenityCategoryById);
router.patch("/updateById/:id", updateAmenityCategory);
router.delete("/deleteById/:id", deleteAmenityCategory);

export default router;
