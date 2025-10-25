import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  Subscribeadd,
  SubscribedeleteById,
  SubscribegetAll,
  SubscribegetById,
  SubscribeupdateById,
} from "../controllers/subscribe.controller";
const router = express.Router();
router.post("/", Subscribeadd);
router.get("/", SubscribegetAll);
router.get("/getById/:id", SubscribegetById);
router.patch("/updateById/:id", SubscribeupdateById);
router.delete("/deleteById/:id", SubscribedeleteById);
export default router;
