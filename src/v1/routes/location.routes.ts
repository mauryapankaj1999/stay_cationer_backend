import { getAllCities, getAllStates } from "v1/controllers/location.controller";
import express from "express";

const router = express.Router();

router.get("/states", getAllStates);
router.get("/cities", getAllCities);

export default router;
