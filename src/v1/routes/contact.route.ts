import express from "express";
import {
  addContact,
  deleteContactById,
  getAllContact,
  getContactById,
  updateContactById,
} from "../controllers/contact.controller";

const router = express.Router();
router.post("/", addContact);
router.get("/", getAllContact);
router.get("/getById/:id", getContactById);
router.patch("/updateById/:id", updateContactById);
router.delete("/deleteById/:id", deleteContactById);
export default router;
