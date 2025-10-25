import express from "express";
import {
  createPage,
  getPage,
  getPageById,
    deletePage,
  updatePage,
} from "v1/controllers/page.controller";

const router = express.Router();

router.post("/", createPage);
router.get("/", getPage);
router.get("/getById/:id", getPageById);
router.patch("/updateById/:id", updatePage);
router.delete("/deleteById/:id", deletePage);

export default router;
