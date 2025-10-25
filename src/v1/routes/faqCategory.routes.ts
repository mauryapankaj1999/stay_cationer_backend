import express from "express";
import {
  createFaqCategory,
  getFaqCategory,
  getFaqCategoryById,
    deleteFaqCategory,
  updateFaqCategory
} from "v1/controllers/faqCategory.controller";

const router = express.Router();

router.post("/", createFaqCategory);
router.get("/", getFaqCategory);
router.get("/getById/:id", getFaqCategoryById);
router.patch("/updateById/:id", updateFaqCategory);
router.delete("/deleteById/:id", deleteFaqCategory);

export default router;
