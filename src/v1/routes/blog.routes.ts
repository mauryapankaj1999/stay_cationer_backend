import express from "express";
import {
  creatBlog,
  deletBlog,
  getBlog,
  getBlogById,
  getBlogBySlug,
  updatBlog,
} from "v1/controllers/blog.controller";

const router = express.Router();

router.post("/", creatBlog);
router.get("/", getBlog);
router.get("/getById/:id", getBlogById);
router.get("/getBySlug/:slug", getBlogBySlug);
router.patch("/updateById/:id", updatBlog);
router.delete("/deleteById/:id", deletBlog);

export default router;
