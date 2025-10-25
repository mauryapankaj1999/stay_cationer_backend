import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  FaqAdd,
  FaqDelete,
  FaqGet,
  FaqGetById,
  FaqUpdate,
} from "v1/controllers/faq.controller";
const router = express.Router();

router.post("/", authorizeJwt, FaqAdd);
router.get("/", FaqGet);
router.get("/getById/:id", FaqGetById);
router.patch("/updateById/:id", authorizeJwt, FaqUpdate);
router.delete("/deleteById/:id", authorizeJwt, FaqDelete);

export default router;
