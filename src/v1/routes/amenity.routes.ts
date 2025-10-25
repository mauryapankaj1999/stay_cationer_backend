import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  AmenityAdd,
  AmenityDelete,
  AmenityGet,
  AmenityGetById,
  AmenityUpdate,
} from "v1/controllers/amenity.controller";
const router = express.Router();

router.post("/", authorizeJwt, AmenityAdd);
router.get("/", AmenityGet);
router.get("/getById/:id", AmenityGetById);
router.patch("/updateById/:id", authorizeJwt, AmenityUpdate);
router.delete("/deleteById/:id", authorizeJwt, AmenityDelete);

export default router;
