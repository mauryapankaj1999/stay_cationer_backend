import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  createGuestOrder,
  getOrder,
  getOrderByDateAndHotelId,
  getOrderById,
  paymentCallback,
  updateOrderById,
  downloadInvoice,
  downloadFoodBillPdf,
  addFoodBillPdf
} from "v1/controllers/order.controler";

let router = express.Router();

// router.post("/createOrder", createOrder);
// router.post("/createCodOrder", createCodOrder);

router.get("/paymentCallback/:orderId", paymentCallback);
// router.get("/phonepePaymentStatusCheck/:orderId", phonepePaymentStatusCheck);
// router.get("/getAllActiveOrders", getAllActiveOrders);
// router.get("/getAllActiveOrdersByUserId", authorizeJwt, getAllActiveOrdersByUserId);
router.get("/", authorizeJwt, getOrder);
router.post(`/createGuestOrder`, createGuestOrder);
router.get(`/getOrderById/:id`, getOrderById);
router.get(`/getOrderByDateAndHotelId/:id`, getOrderByDateAndHotelId);
router.patch(`/updateOrderById/:orderId`, updateOrderById);

router.get("/download/:orderId", downloadInvoice);
router.get("/downloadFoodBillPdf/:orderId", downloadFoodBillPdf);
router.post("/addFoodBillPdf/:orderId", addFoodBillPdf);
// // router.post(`/cancelOrderById/:id`, cancelOrderById);
// router.patch(`/updateStatusOrderById/:id`, updateStatusOrderById);

// router.get("/emailSend/:orderId",authorizeJwt, paymentCallback);

export default router;
