import express from "express";
import {
  creatProperty,
  deletProperty,
  getProperty,
  getPropertyById,
  getPropertyBySlug,
  getPropertyWebsite,
  updatProperty,
  requestPayout,
} from "v1/controllers/property.controller";

const router = express.Router();

router.post("/", creatProperty);
router.get("/", getProperty);
router.get("/website", getPropertyWebsite);
router.get("/getById/:id", getPropertyById);
router.post("/requestPayout/:id", requestPayout);
router.get("/getBySlug/:slug", getPropertyBySlug);
router.patch("/updateById/:id", updatProperty);
router.delete("/deleteById/:id", deletProperty);

export default router;
