import express from "express";
import { creatDestination, deletDestination, getDestination, getDestinationById, updatDestination } from "v1/controllers/destination.controller";

const router = express.Router();

router.post("/", creatDestination);
router.get("/", getDestination);
router.get("/getById/:id", getDestinationById);
router.patch("/updateById/:id", updatDestination);
router.delete("/deleteById/:id", deletDestination);

export default router;
