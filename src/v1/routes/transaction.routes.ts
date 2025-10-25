import express from "express";
import {
  createTransaction,
  getTransaction,
  getTransactionById,
    deleteTransaction,
  updateTransaction
} from "v1/controllers/transaction.controller";

const router = express.Router();

router.post("/", createTransaction);
router.get("/", getTransaction);
router.get("/getById/:id", getTransactionById);
router.patch("/updateById/:id", updateTransaction);
router.delete("/deleteById/:id", deleteTransaction);

export default router;
