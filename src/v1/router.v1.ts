import express from "express";
import indexRouter from "v1/routes/index.routes";
import userRouter from "v1/routes/user.routes";
import locationRouter from "v1/routes/location.routes";
import bannerRouter from "v1/routes/banner.routes";
import blogRouter from "v1/routes/blog.routes";
import faqRouter from "v1/routes/faq.routes";
import faqCategoryRouter from "v1/routes/faqCategory.routes";
import destinationRouter from "v1/routes/destination.routes";
import collectionRouter from "v1/routes/collection.routes";
import loyaltyQueryRouter from "v1/routes/LoyaltyQuery.routes";
import amenityRouter from "v1/routes/amenity.routes";
import amenityCategoryRouter from "v1/routes/amenityCategory.routes";
import propertyRouter from "v1/routes/property.routes";
import reviewRouter from "v1/routes/review.routes";
import rateRouter from "v1/routes/rate.routes";
import orderRouter from "v1/routes/order.routes";
import transactionOrder from "v1/routes/transaction.routes";
import couponRouter from "v1/routes/coupon.routes";
import pageRouter from "v1/routes/page.routes";
import dashboardRouter from "v1/routes/dashboard.routes";
import reelsRouter from "v1/routes/reels.routes";
import wishlistRouter from "v1/routes/wishlist.routes";
import enquiryRouter from "v1/routes/enquiry.routes";
import createGiftRouter from "v1/routes/createGift.routes";
import SubscribeRouter from "v1/routes/subscribe.routes";
import PropertyEnuiryRouter from "v1/routes/PropertyEnuiry.routes";
import notificationRouter from "v1/routes/notification.routes";
import contactRouter from "v1/routes/contact.route";
import HomeLogRouter from "v1/routes/HomeLog.routes";
const router = express.Router();

router.use("/", indexRouter);
router.use("/user", userRouter);
router.use("/location", locationRouter);
router.use("/banner", bannerRouter);
router.use("/blog", blogRouter);
router.use("/faq", faqRouter);
router.use("/faqCategory", faqCategoryRouter);
router.use("/contact", contactRouter);

// Hotels

router.use("/amenity", amenityRouter);
router.use("/amenityCategory", amenityCategoryRouter);
router.use("/destination", destinationRouter);
router.use("/collection", collectionRouter);

router.use("/property", propertyRouter);
router.use("/review", reviewRouter);
router.use("/rate", rateRouter);
router.use("/order", orderRouter);

router.use("/transaction", transactionOrder);
router.use("/coupon", couponRouter);
router.use("/reels", reelsRouter);

router.use("/page", pageRouter);
router.use("/dashboard", dashboardRouter);
router.use("/wishlist", wishlistRouter);
router.use("/enquiry", enquiryRouter);
router.use("/loyaltyquery", loyaltyQueryRouter);
router.use("/create-gift", createGiftRouter);
router.use("/Subscribe", SubscribeRouter);
router.use("/PropertyEnuiry", PropertyEnuiryRouter);
router.use("/notification", notificationRouter);
router.use("/HomeLog", HomeLogRouter);

export default router;
