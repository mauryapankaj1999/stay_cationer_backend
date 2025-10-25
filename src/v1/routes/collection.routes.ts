import express from "express";
import { creatCollection, deletCollection, getCollection, getCollectionById, updatCollection } from "v1/controllers/collection.controller";

const router = express.Router();

router.post("/", creatCollection);
router.get("/", getCollection);
router.get("/getById/:id", getCollectionById);
router.patch("/updateById/:id", updatCollection);
router.delete("/deleteById/:id", deletCollection);

export default router;
