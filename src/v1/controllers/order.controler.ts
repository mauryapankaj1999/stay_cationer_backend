import { Request, Response, NextFunction } from "express";
import { createPaymentOrder } from "helpers/razorpay";
import { DiscountObj, Order } from "models/order.model";
import { Property } from "models/property.model";
import { Rate } from "models/rate.model";
import { PipelineStage } from "mongoose";
import { paginateAggregate } from "utils/paginateAggregate";
import { MESSAGE } from "common/messages.common";
import { ROLES } from "common/constant.common";
import { newObjectId } from "utils/mongoQueries";
import moment from "moment";
import { createInvoice } from "utils/invoiceTemplate";
import * as path from "path";
import * as fs from "fs";
import { deleteFileUsingUrl, storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { SendBrevoMail } from "services/brevoMail.service";
import { notification } from "models/notification.model";
import generateHTML from "helpers/generateHTML";
import { User } from "models/user.model";
import { sendBookingSMS, sendOTP } from "helpers/SendSMS";

// export const createOrder = = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userObj = await User.findById(req.user.userId).lean().exec();
//     if (!userObj) throw new Error("User Not Found");

//     let userCartObj = await UserCart.findOne({ userId: req.user.userId }).lean().exec();
//     let currencyObj = userCartObj?.currencyObj;

//     if (userCartObj.items.length <= 0) {
//       throw new Error("Your Cart is empty");
//     }
//     for (let el of userCartObj.items) {
//       let hotelObj = await HotelModel.findById(el.productId).lean().exec();
//       if (!hotelObj) {
//         throw new Error(`HotelModel Not Found Please empty your cart`);
//       }
//       el.price = hotelObj?.mrp;
//       el.convertedPrice = parseFloat((hotelObj?.mrp * currencyObj?.convertRate).toFixed(2));
//       let tempGst = hotelObj?.gst;
//       let tempHalfGst = tempGst / 2;
//       el.cgst = parseFloat((el.price * (tempHalfGst / 100)).toFixed(2));
//       el.sgst = parseFloat((el.price * (tempHalfGst / 100)).toFixed(2));
//       el.igst = parseFloat((el.price * (tempGst / 100)).toFixed(2));
//       el.name = hotelObj?.name;
//       el.image = hotelObj?.imageArr[0]?.image;
//       el.sku = hotelObj?.sku;
//       el.productImage = hotelObj?.productImage;
//       el.totalPrice = parseInt((el.price + el.cgst + el.sgst) * el.quantity);
//       el.convertedTotalPrice = parseInt(el.totalPrice * currencyObj?.convertRate);

//       let stockup = parseInt(el.quantity);

//       if (el.variantobj && el.variantobj != "" && el.variantobj.name) {
//         let variantId = el.variantobj?._id;
//         let variaStock = parseInt(el.variantobj.currentStock - stockup);
//         // console.log(variaStock,"variantobjvariaStockvariaStock",el.variantobj)

//         let update = await HotelModel.findOneAndUpdate(
//           { "attributesArr._id": variantId },
//           { $set: { "attributesArr.$.currentStock": +variaStock } },
//           { new: true },
//         ).exec();
//       } else {
//         let update = await HotelModel.findOneAndUpdate(
//           { _id: el.productId },
//           { $inc: { stock: -stockup } },
//           { new: true },
//         ).exec();
//         // console.log(update,"updateupdateupdateupdateupdateupdateupdateupdateupdate")
//       }
//     }
//     let subTotalAmount = userCartObj.items.reduce((acc, el) => acc + el.price * el.quantity, 0);
//     let subConvertedTotalAmount = parseFloat((subTotalAmount * currencyObj?.convertRate).toFixed(2));

//     ///tax calculation
//     let totalAmount = userCartObj.items.reduce((acc, el) => acc + (el.price + el.cgst + el.sgst) * el.quantity, 0);
//     totalAmount = parseInt(totalAmount);

//     let dicountObj = null;
//     // console.log(totalAmount,"totalAmount")
//     if (userCartObj.dicountObj && userCartObj.dicountObj?.amount) {
//       totalAmount = parseInt(totalAmount) - parseInt(userCartObj.dicountObj.amount);
//       // console.log(totalAmount," dicountObj totalAmount")
//       dicountObj = userCartObj.dicountObj;
//     }
//     console.log(totalAmount, "dicountObjdicountObj", userCartObj._id);

//     let shippingCharges = 0;

//     if (userCartObj.shipping && userCartObj.shipping != "0") {
//       totalAmount = parseInt(totalAmount) + parseInt(userCartObj.shipping);
//       shippingCharges = userCartObj.shipping;
//     }
//     let convertedTotalAmount = totalAmount;
//     let amount = totalAmount * 100;
//     let currency = "INR";
//     if (currencyObj?.code && currencyObj?.convertRate) {
//       convertedTotalAmount = Math.round(parseInt(totalAmount) * parseFloat(currencyObj?.convertRate));
//       console.log(totalAmount, parseFloat(currencyObj?.convertRate));

//       amount = convertedTotalAmount * 100;
//       currency = currencyObj.code;

//       if (currency.length >= 4) {
//         currency = currency.substring(0, currency.length - 1);
//       }
//     }
//     let obj = {
//       userId: req.user.userId,
//       currencyObj: currencyObj,
//       addressObj: userCartObj.addressObj,
//       productsArr: userCartObj.items,
//       subTotalAmount,
//       subConvertedTotalAmount,
//       totalAmount,
//       convertedTotalAmount,
//       active: true,
//       dicountObj,
//       shippingCharges,
//       orderType: OrderType.ONLINE,
//     };
//     // console.log(obj,"order.items")
//     if (userCartObj.addressObj?.orderNotes) {
//       obj.orderNotes = userCartObj.addressObj.orderNotes;
//     }

//     console.log(currency, "currencyObjcurrencyObjcurrencyObj", convertedTotalAmount, amount);

//     let orderObj = await new Order(obj).save();
//     let options = {
//       amount: amount,
//       currency: currency,
//       receipt: new Date().getTime(),
//     };

//     let orderPaymentObj = await createPaymentOrder(options);

//     let obj1 = await Order.findByIdAndUpdate(orderObj._id, {
//       "paymentObj.gatwayPaymentObj": orderPaymentObj,
//     })
//       .lean()
//       .exec();
//     let obj2 = await UserCart.findOneAndUpdate({ userId: `${req.user.userId}` }, { dicountObj: {} }).exec();

//     res.status(200).json({
//       message: "Order Created",
//       data: orderPaymentObj,
//       orderId: orderObj._id,
//       success: true,
//     });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };

export const createGuestOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // console.log(req.body.propertyId, "check property Id ");
    // if (!req.body.propertyId) {
    //   throw new Error("Please Select Properties");
    // }

    let hotelObj = await Property.findById(req.body.propertyId).lean().exec();
    if (!hotelObj) {
      throw new Error(`Properties Not Found`);
    }

    const userObj = await User.findById(req.body.userId).lean().exec();
    if (userObj?.role && userObj?.role !== ROLES.USER) {
      throw new Error(`You are not allowed to create guest order with this user`);
    }
    let userData: any = {
      propertyId: hotelObj?._id,
      name: hotelObj.name,
      image: hotelObj.mainImage,
      price: req.body.subtotalPrice,

      // let tempGst = hotelObj?.gst;
      // let tempHalfGst = tempGst / 2;
      // el.cgst = parseFloat((el.price * (tempHalfGst / 100)).toFixed(2));
      // el.sgst = parseFloat((el.price * (tempHalfGst / 100)).toFixed(2));
      // el.igst = parseFloat((el.price * (tempGst / 100)).toFixed(2));
      // el.name = hotelObj?.name;
    };
    let subTotalAmount = req.body.grandTotal;
    let totalAmount = req.body.grandTotal;

    ///tax calculation
    totalAmount = parseInt(totalAmount);
    let dicountObj: DiscountObj = {
      code: "",
      amount: 0,
    };
    let offerObj = {};
    if (req.body.discount) {
      dicountObj.amount = Number(req.body.discount.value);
    }

    const date1 = moment(new Date(req.body.startDate));
    const date2 = moment(new Date(req.body.endDate));
    const days = Math.abs(date1.diff(date2, "days"));

    let gst = req.body.gst || { tax: 0, amount: 0, baseAmount: 0 };
    if (gst.baseAmount && gst.tax) {
      const calculatedGst = Math.round(gst.baseAmount * (gst.tax / 100));
      gst.amount = calculatedGst;
    }
    let obj: any = {
      hotelsArr: [userData],
      sellerId: hotelObj?.sellerId,
      propertyId: req.body.propertyId,
      name: userObj?.name ?? req.body.name,
      email: userObj?.email ?? req.body.email,
      mobile: userObj?.phone ?? req.body.mobile,
      message: req.body.message,
      adult: req.body.adult,
      bookingAmount: req.body.bookingAmount,
      amountReceived: req.body.amountReceived,
      amountDue: req.body.amountDue,
      bookingstatus: req.body.bookingstatus,
      orderStatus: req.body.bookingstatus?.toUpperCase() || "CONFIRMED",
      child: req.body.child,
      nights: days,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      gst: {
        tax: gst.tax || 0,
        amount: gst.amount || 0,
        baseAmount: gst.baseAmount || 0,
      },
      subTotalAmount,
      totalAmount,
      active: true,
      dicountObj,
      offerObj,
      commission: req.body.commission || 0,
      bookingVia: req.body.bookingVia || "",
      noOfPets: req.body.noOfPets || "",
      increaseAmountBy: req.body.increaseAmountBy || 0,
    };
    if (req.body.paymentType && req.body.paymentType != "") {
      obj.paymentType = req.body.paymentType;
    }
    if (typeof req.body.gst === "string") {
      obj.gst = req.body.gst;
    }
    if (req.body.userId) {
      obj.userId = req.body.userId;
    }

    let orderObj = await new Order(obj).save();

    let options: any = {
      amount: obj.totalAmount * 100,
      currency: "INR",
      receipt: new Date().getTime(),
    };
    let orderPaymentObj: any = {};

    orderPaymentObj = await createPaymentOrder(options);

    await Order.findByIdAndUpdate(orderObj._id, {
      "paymentObj.gatwayPaymentObj": orderPaymentObj,
    })
      .lean()
      .exec();
    console.log(orderObj, "check orderObj");
    const notificationObj = {
      link: `/booking/${orderObj._id}`,
      userName: userObj?.name,
      id: orderObj._id,
      text: `New booking  by ${userObj?.name}`,
      seen: false,
      createdAt: new Date(),
    };
    const notifiy = new notification(notificationObj);
    await notifiy.save();

    console.log(orderObj, "check orderObj after save");

    let title = "<title>StayCationer Booking Confirmation</title>";

    let content = `
<div class="container">
  <!-- Header with gradient background -->
  <div class="header">
    <img src="https://thestaycationer.in/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooterlogo.253266f1.png&w=1920&q=75/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooterlogo.253266f1.png&w=1920&q=75" alt="StayCationer Logo" class="logo" />
    <h1 class="confirmation-title">Your Booking is Confirmed!</h1>
  </div>

  <!-- Property image -->
  <!-- <img src="${orderObj.hotelsArr[0].image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=200&q=80"}" alt="${orderObj.hotelsArr[0].name}" class="property-image" /> -->

  <!-- Booking summary -->
  <div class="section">
    <div class="section-header">
      <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h2 class="section-title">Booking Summary</h2>
    </div>

    <div class="detail-row">
      <div class="detail-label">Booking ID:</div>
      <div class="detail-value">#${orderObj._id.toString().slice(-6).toUpperCase()}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Property:</div>
      <div class="detail-value">${orderObj.hotelsArr[0].name}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Check-in:</div>
      <div class="detail-value">${moment(orderObj.startDate).format("ddd, D MMM YYYY") + "(11:00 AM)"}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Check-out:</div>
      <div class="detail-value">${moment(orderObj.endDate).format("ddd, D MMM YYYY") + "(11:00 AM)"}}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Guests:</div>
      <div class="detail-value">${orderObj.adult || 0} Adults, ${orderObj.child || 0} Children</div>
    </div>
  </div>

  <!-- Guest information -->
  <div class="section">
    <div class="section-header">
      <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <h2 class="section-title">Guest Information</h2>
    </div>

    <div class="detail-row">
      <div class="detail-label">Primary Guest:</div>
      <div class="detail-value">${orderObj.name}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Email:</div>
      <div class="detail-value">${orderObj.email}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Phone:</div>
      <div class="detail-value">${orderObj.mobile}</div>
    </div>
  </div>

  <!-- Payment details -->
  <div class="section">
    <div class="section-header">
      <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <h2 class="section-title">Payment Details</h2>
    </div>

    <div class="detail-row">
      <div class="detail-label">Payment Method:</div>
      <div class="detail-value">${req.body.paymentMethod || "UPI"}</div>
    </div>
    <!--<div class="detail-row">
      <div class="detail-label">Amount Paid:</div>
      <div class="detail-value">₹${orderObj.amountReceived || 0}</div>
    </div> -->
   <!-- <div class="detail-row">
      <div class="detail-label">Amount Due:</div>
      <div class="detail-value">₹${orderObj.amountDue || 0}</div>
    </div> -->
    <div class="detail-row">
      <div class="detail-label">Payment Status:</div>
      <div class="detail-value" style="color: #4CAF50; font-weight: 600;">${orderObj.bookingstatus || "Confirmed"}</div>
    </div>
  </div>

  <!-- Total amount -->
  <div class="total-box">
    <div>Total Amount Paid</div>
    <div class="total-amount">₹${orderObj.subTotalAmount}</div>
    <div>(including all taxes)</div>
  </div>

  <!-- Note section -->
  <div class="section">
    <div class="section-header">
      <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h2 class="section-title">Important Note</h2>
    </div>

    <div class="note-box">
      <p><strong>Please carry a valid government-issued photo ID</strong> at the time of check-in. The name on the ID must match the booking details.</p>
      <p>Check-in time is 2:00 PM and check-out time is 11:00 AM. Early check-in/late check-out is subject to availability and may incur additional charges.</p>
      <p>For any changes to your booking, please contact our customer support at least 48 hours prior to your check-in date.</p>
    </div>
  </div>

  <!-- Cancellation policy -->
  <div class="section">
    <div class="section-header">
      <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 class="section-title">Cancellation Policy</h2>
    </div>

    <div class="policy-note">
      <p><strong>Free cancellation</strong> until ${moment(orderObj.startDate).subtract(2, "days").format("ddd, D MMM YYYY, h:mm A")}</p>
      <p>After this date, the reservation is non-refundable. Any changes to your reservation must be made at least 48 hours prior to check-in.</p>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Need help? Contact StayCationer support at support@staycationer.com or call +91 9876543210</p>
    <p>© ${new Date().getFullYear()} StayCationer. All rights reserved.</p>
  </div>
</div>
`;
    let style = `
<style>
body {
    margin: 0;
    padding: 0;
    background-color: #f8f9fa;
    font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #333;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  .header {
    background: linear-gradient(135deg, #FF7B25 0%, #FFA500 100%);
    padding: 30px 20px;
    text-align: center;
    color: white;
  }

  .logo {
    height: 40px;
    margin-bottom: 10px;
  }

  .confirmation-title {
    font-size: 28px;
    font-weight: 700;
    margin: 10px 0;
    color: white;
  }

  .property-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .section {
    padding: 20px 25px;
    border-bottom: 1px solid #f0f0f0;
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  .section-icon {
    width: 24px;
    height: 24px;
    margin-right: 10px;
    color: #FF7B25;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #FF7B25;
    margin: 0;
  }

  .detail-row {
    display: flex;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }

  .detail-label {
    flex: 1 0 120px;
    font-weight: 600;
    color: #555;
    min-width: 120px;
  }

  .detail-value {
    flex: 2;
    color: #333;
    min-width: 150px;
  }

  .highlight-box {
    background-color: #FFF9F2;
    border-left: 4px solid #FF7B25;
    padding: 15px;
    margin: 15px 0;
    border-radius: 0 4px 4px 0;
  }

  .total-box {
    background: linear-gradient(135deg, #FFF5EB 0%, #FFEEDD 100%);
    padding: 20px;
    text-align: center;
    border-top: 1px dashed #FFA500;
    border-bottom: 1px dashed #FFA500;
  }

  .total-amount {
    font-size: 24px;
    font-weight: 700;
    color: #FF7B25;
    margin: 5px 0;
  }

  .cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #FF7B25 0%, #FFA500 100%);
    color: white;
    padding: 12px 30px;
    text-decoration: none;
    border-radius: 30px;
    font-weight: 600;
    margin: 20px 0;
    box-shadow: 0 4px 12px rgba(255, 123, 37, 0.3);
  }

  .footer {
    padding: 20px;
    text-align: center;
    background-color: #f8f9fa;
    font-size: 12px;
    color: #777;
  }

  .policy-note {
    background-color: #F5F5F5;
    padding: 15px;
    border-radius: 8px;
    margin-top: 10px;
    font-size: 13px;
  }

  .note-box {
    background-color: #F0F8FF;
    border-left: 4px solid #4682B4;
    padding: 15px;
    margin: 15px 0;
    border-radius: 0 4px 4px 0;
    font-size: 14px;
  }

  /* Responsive adjustments */
  @media only screen and (max-width: 600px) {
    .container {
      margin: 0;
      border-radius: 0;
      box-shadow: none;
    }

    .confirmation-title {
      font-size: 24px;
    }

    .section {
      padding: 15px;
    }

    .property-image {
      height: 160px;
    }

    .detail-label {
      flex: 1 0 100%;
      margin-bottom: 5px;
    }

    .detail-value {
      flex: 1 0 100%;
      padding-left: 15px;
    }

    .total-amount {
      font-size: 22px;
    }

    .cta-button {
      display: block;
      text-align: center;
      margin: 20px auto;
      width: 80%;
    }
  }

  @media only screen and (max-width: 480px) {
    .header {
      padding: 20px 15px;
    }

    .logo {
      height: 35px;
    }

    .confirmation-title {
      font-size: 22px;
    }

    .section-title {
      font-size: 16px;
    }

    .total-amount {
      font-size: 20px;
    }
  }

  @media only screen and (min-width: 601px) and (max-width: 768px) {
    .container {
      max-width: 90%;
    }

    .property-image {
      height: 180px;
    }
  }
</style>
`;

    let html = generateHTML(title, content, style);

    const user = await SendBrevoMail(
      "Your StayCationer Booking Confirmation",
      [{ email: orderObj.email, name: orderObj.name }],
      html,
    );

    title = "<title>New Booking Confirmation - StayCationer Team</title>";
    style = ` <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f8f9fa;
        font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }
      .header {
        background: linear-gradient(135deg, #FF7B25 0%, #FFA500 100%);
        padding: 30px 20px;
        text-align: center;
        color: white;
      }
      .logo {
        height: 40px;
        margin-bottom: 10px;
      }
      .confirmation-title {
        font-size: 28px;
        font-weight: 700;
        margin: 10px 0;
        color: white;
      }
      .section {
        padding: 20px 25px;
        border-bottom: 1px solid #f0f0f0;
      }
      .message {
        font-size: 16px;
        color: #333;
        margin-bottom: 20px;
        line-height: 1.8;
      }
      .section-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }
      .section-icon {
        width: 24px;
        height: 24px;
        margin-right: 10px;
        color: #FF7B25;
      }
      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #FF7B25;
        margin: 0;
      }
      .detail-row {
        display: flex;
        margin-bottom: 10px;
        flex-wrap: wrap;
      }
      .detail-label {
        flex: 1 0 120px;
        font-weight: 600;
        color: #555;
        min-width: 120px;
      }
      .detail-value {
        flex: 2;
        color: #333;
        min-width: 150px;
      }
      .total-box {
        background: linear-gradient(135deg, #FFF5EB 0%, #FFEEDD 100%);
        padding: 20px;
        text-align: center;
        border-top: 1px dashed #FFA500;
        border-bottom: 1px dashed #FFA500;
      }
      .total-amount {
        font-size: 24px;
        font-weight: 700;
        color: #FF7B25;
        margin: 5px 0;
      }
      .footer {
        padding: 20px;
        text-align: center;
        background-color: #f8f9fa;
        font-size: 12px;
        color: #777;
      }
      @media only screen and (max-width: 600px) {
        .container {
          margin: 0;
          border-radius: 0;
          box-shadow: none;
        }
        .confirmation-title {
          font-size: 24px;
        }
        .section {
          padding: 15px;
        }
        .message {
          font-size: 14px;
          margin-bottom: 16px;
        }
        .detail-label {
          flex: 1 0 100%;
          margin-bottom: 5px;
        }
        .detail-value {
          flex: 1 0 100%;
          padding-left: 15px;
        }
        .total-amount {
          font-size: 22px;
        }
      }
      @media only screen and (max-width: 480px) {
        .header {
          padding: 20px 15px;
        }
        .logo {
          height: 35px;
        }
        .confirmation-title {
          font-size: 22px;
        }
        .section-title {
          font-size: 16px;
        }
        .total-amount {
          font-size: 20px;
        }
      }
      @media only screen and (min-width: 601px) and (max-width: 768px) {
        .container {
          max-width: 90%;
        }
      }
    </style>`;
    content = `  <div class="container">
      <div class="header">
        <img src="https://thestaycationer.in/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooterlogo.253266f1.png&w=1920&q=75" alt="StayCationer Logo" class="logo" />
        <h1 class="confirmation-title">New Booking Confirmation</h1>
      </div>
      <div class="section">
        <div class="message">
          A new booking has been confirmed. Please review the details below.
        </div>
      </div>
      <div class="section">
        <div class="section-header">
          <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 class="section-title">Booking Summary</h2>
        </div>
        <div class="detail-row">
          <div class="detail-label">Booking ID:</div>
          <div class="detail-value">${orderObj._id}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Property:</div>
          <div class="detail-value">${hotelObj.name}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Check-in:</div>
          <div class="detail-value">${moment(orderObj.startDate).format("YYYY-MM-DD")}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Check-out:</div>
          <div class="detail-value">${moment(orderObj.endDate).format("YYYY-MM-DD")}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Guests:</div>
          <div class="detail-value">${orderObj.adult} Adults, ${orderObj.child} Children</div>
        </div>
      </div>
      <div class="section">
        <div class="section-header">
          <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 class="section-title">Guest Information</h2>
        </div>
        <div class="detail-row">
          <div class="detail-label">Primary Guest:</div>
          <div class="detail-value">${userObj?.name}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Email:</div>
          <div class="detail-value">${userObj?.email}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Phone:</div>
          <div class="detail-value">${userObj?.phone}</div>
        </div>
      </div>
      <div class="section">
        <div class="section-header">
          <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h2 class="section-title">Payment Details</h2>
        </div>
        <div class="detail-row">
          <div class="detail-label">Payment Method:</div>
          <div class="detail-value">razorpay</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Payment Status:</div>
          <div class="detail-value" style="color: #4CAF50; font-weight: 600;">Confirmed</div>
        </div>
      </div>
      <div class="total-box">
        <div>Total Amount Paid</div>
        <div class="total-amount">₹${orderObj.totalAmount}</div>
        <div>(including all taxes)</div>
      </div>
      <div class="footer">
        <p>You are receiving this notification as part of the StayCationer Team alerts.</p>
        <p>© 2025 StayCationer</p>
      </div>
    </div>`;
    html = generateHTML(title, content, style);
    const admin = await SendBrevoMail(
      "Booking Confirmation",
      [{ email: process.env.ADMIN_EAMIL ?? "", name: orderObj.name }],
      html,
    );
    const sent = await sendBookingSMS({
      number: orderObj.mobile,
      name: orderObj.name,
      bookingId: orderObj._id.toString(),
      property: orderObj.hotelsArr[0]?.name,
      checkIn: moment(orderObj.startDate).format("ddd, D MMM YYYY") + " (11:00 AM)",
      checkOut: moment(orderObj.endDate).format("ddd, D MMM YYYY") + " (11:00 AM)",
    });
    console.log(user, "check adminsend");

    res.status(200).json({
      message: "Order Created",
      data: orderPaymentObj,
      orderId: orderObj._id,
      success: true,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const paymentCallback = async (req: Request, res: Response, next: NextFunction) => {
  console.log("check working payment callback");
  try {
    /**
     *
     *  if there is no payment id throw error
     *
     */

    // send all details in the req.query
    // console.log(req.params, req.query);
    console.log(req.user, "=================================");
    console.log("22222222222222342342222222222222222222222userObjuserObjuserObjuserObjuserObj");
    // const userObj = await User.findById(req.user.userId).lean().exec();
    let tempOrderObj = await Order.findById(req.params.orderId).exec();
    if (!tempOrderObj) throw new Error("Order Not Found");

    let orderObj = await Order.findByIdAndUpdate(req.params.orderId, {
      "paymentObj.paymentChk": 1,
      $push: { "paymentObj.gatewayPaymentArr": req.query },
      active: true,
      orderStatus: "CONFIRMED",
    })
      .lean()
      .exec();
    console.log(tempOrderObj?.email, "tempOrderObjtempOrderObjtempOrderObjtempOrderObj");
    console.log(orderObj, "orderObjorderObjorderObjorderObj");

    let obj3: any = { ...orderObj };
    if (orderObj) {
      if (orderObj.startDate && orderObj.endDate) {
        let query: any = {};
        if (orderObj.startDate) {
          query.date = {
            $gte: new Date(orderObj.startDate),
          };
        }
        if (orderObj.endDate) {
          query.date = {
            ...query.date,
            $lt: new Date(orderObj.endDate),
          };
        }
        if (orderObj.propertyId) {
          query.propertyId = orderObj.propertyId;
        }

        let rateArr = await Rate.find({ ...query });
        if (rateArr && rateArr?.length > 0) {
          for (const rate of rateArr) {
            await Rate.findByIdAndUpdate(rate?._id, {
              isAvailable: false,
              orderId: orderObj?._id,
            });
          }
        }
        let hotelObj = await Property.findById(orderObj.propertyId).lean().exec();
        // obj3.hotelName = hotelObj.name;
        // obj3.hotelImage = "/api/uploads/" + hotelObj.mainImage;
      }
      // let emailArr=[orderObj?.addressObj?.email]
      let title = "Booking has been confirmed";
      // let emailArr = [orderObj.email, "hello@wabisabistays.com"];
      // let customerTitle = `Booking has been confirmed #${orderObj._id}`;
      // let adminTitle = `New Booking #${orderObj?._id} -  ${orderObj.name}`;
      // obj3.createdAtDate2 = new Date(orderObj.createdAt).toDateString();
      // obj3.checkin = new Date(orderObj.startDate).toDateString();
      // obj3.checkout = new Date(orderObj.endDate).toDateString();
      // obj3.dicountObj = orderObj.dicountObj ? orderObj.dicountObj : false;
      // obj3.offerObj = orderObj.offerObj ? orderObj.offerObj : false;
      // await sendMail(emailArr, customerTitle, obj3, true, "", false);
      // let emailAr2 = ["naman@wabisabistays.com"];
      // await sendMail(emailAr2, adminTitle, obj3, true, "", false);
    }

    // const html = await invoiceGenerator(tempOrderObj);
    // console.log(tempOrderObj, "check tempOrderObj");

    // const value = await SendBrevoMail(
    //   "Booking has been confirmed",
    //   [{ email: tempOrderObj.email, name: tempOrderObj.name }],
    //   html,
    // );

    // console.log(value, "check value ");

    res.json({
      message: "Payment Successfull",
      success: true,
      orderId: tempOrderObj._id,
      data: orderObj,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let orderObj: any = await Order.findById(req.params.id).populate("hotelsArr.propertyId").lean().exec();
    if (!orderObj) throw new Error("Booking Not Found");

    if (orderObj.propertyId) {
      orderObj.hotelObj = await Property.findById(orderObj.propertyId).exec();
    }

    res.status(200).json({ message: "Booking", data: orderObj, success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getOrderByDateAndHotelId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let obj: any = {
      propertyId: newObjectId(req.params.id),
    };

    console.log(req.query, "getOrderByDateAndHotelId");

    if (req.query.startDate && req.query.endDate) {
      // For date range queries - find bookings that overlap with the range
      obj.$and = [
        {
          startDate: {
            $lt: new Date(`${req.query.endDate}`), // Booking starts before range ends
          },
        },
        {
          endDate: {
            $gt: new Date(`${req.query.startDate}`), // Booking ends after range starts
          },
        },
      ];
    } else if (req.query.startDate) {
      // For single date click - find bookings that include this date
      const clickedDate = new Date(`${req.query.startDate}`);
      const nextDay = new Date(clickedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      obj.$and = [
        {
          startDate: {
            $lte: clickedDate, // Booking starts on or before clicked date
          },
        },
        {
          endDate: {
            $gt: clickedDate, // Booking ends after clicked date
          },
        },
      ];
    }

    let orderObj: any = await Order.findOne(obj).populate("hotelsArr.propertyId").lean().exec();

    if (!orderObj) throw new Error("Booking Not Found");

    if (orderObj.propertyId) {
      orderObj.hotelObj = await Property.findById(orderObj.propertyId).exec();
    }

    res.status(200).json({ message: "Order", data: orderObj, success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.user, "check user");

  try {
    let matchObj: Record<string, any> = {};
    if (req.query.orderStatus && req.query.orderStatus !== "") {
      matchObj.orderStatus = req.query.orderStatus;
    }
    if (req.query.status) {
      matchObj.status = req.query.status;
    }
    if (req.query.propertyId && req.query.propertyId !== "") {
      matchObj.propertyId = newObjectId(req.query.propertyId);
    }
    if (req.query.query) {
      matchObj.$or = [
        {
          name: { $regex: req.query.query, $options: "i" },
        },
        {
          email: { $regex: req.query.query, $options: "i" },
        },
        {
          mobile: { $regex: req.query.query, $options: "i" },
        },
        {
          gstNo: { $regex: req.query.query, $options: "i" },
        },
        {
          orderId: { $regex: req.query.query, $options: "i" },
        },
        {
          "hotelsArr.name": { $regex: req.query.query, $options: "i" },
        },
        {
          "hotelsArr.email": { $regex: req.query.query, $options: "i" },
        },
        {
          "hotelsArr.mobile": { $regex: req.query.query, $options: "i" },
        },
        {
          "hotelsArr.gstNo": { $regex: req.query.query, $options: "i" },
        },
        {
          totalAmount: { $regex: req.query.query, $options: "i" },
        },
        {
          subTotalAmount: { $regex: req.query.query, $options: "i" },
        },
      ];
    }
    if (req.user) {
      let user = req.user;
      let role = user.role;
      if (role == ROLES.SELLER) {
        matchObj.sellerId = newObjectId(user.userId);
      }

      if (role == ROLES.USER) {
        matchObj.userId = newObjectId(user.userId);
      }
    }

    // If either startDate or endDate is provided, match orders where either condition is true
    if (req.query.startDate || req.query.endDate) {
      matchObj.$or = [];
      if (req.query.startDate) {
        matchObj.$or.push({
          startDate: { $gte: new Date(`${req.query.startDate}`) },
        });
      }
      if (req.query.endDate) {
        matchObj.$or.push({
          endDate: { $lte: new Date(`${req.query.endDate}`) },
        });
      }
      // If both are provided, $or will have both conditions
    }

    if (req.user) {
      let user = req.user;
      let role = user.role;
      if (role == ROLES.SELLER) {
        matchObj.sellerId = newObjectId(user.userId);
      }
    }

    let pipeline: PipelineStage[] = [
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: matchObj,
      },
      {
        $group: {
          _id: null, // This groups all documents together
          totalRevenue: { $sum: "$totalAmount" }, // Calculate the total revenue across all documents
          data: { $push: "$$ROOT" }, // Push all documents to a new field called 'data'
        },
      },
      {
        $unwind: "$data", // Unwind the grouped documents back into individual documents
      },
      {
        $addFields: {
          totalRevenue: "$totalRevenue", // Add the totalRevenue to each document
        },
      },
      {
        $project: {
          _id: "$data._id",
          name: "$data.name",
          noOfPets: "$data.noOfPets",
          mobile: "$data.mobile",
          email: "$data.email",
          nights: "$data.nights",
          adult: "$data.adult",
          bookingAmount: "$data.bookingAmount",
          amountReceived: "$data.amountReceived",
          amountDue: "$data.amountDue",
          bookingstatus: "$data.bookingstatus",
          child: "$data.child",
          startDate: "$data.startDate",
          endDate: "$data.endDate",
          userId: "$data.userId",
          propertyId: "$data.propertyId",
          sellerId: "$data.sellerId",
          hotelsArr: "$data.hotelsArr",
          paymentObj: "$data.paymentObj",
          gst: "$data.gst",
          subTotalAmount: "$data.subTotalAmount",
          totalAmount: "$data.totalAmount",
          orderStatus: "$data.orderStatus",
          orderStatusArr: "$data.orderStatusArr",
          createdAt: "$data.createdAt",
          dicountObj: "$data.dicountObj",
          updatedAt: "$data.updatedAt",
          active: "$data.active",
          totalRevenue: "$totalRevenue", // Include the totalRevenue in each document
        },
      },
    ];

    console.log(JSON.stringify(pipeline, null, 2), "pipelinepipelinepipeline");
    const BannerArr: any = await paginateAggregate(Order, pipeline, req.query);

    res.status(200).json({
      message: "All Booking",
      data: BannerArr.data,
      total: BannerArr.total,
      totalRevenue: BannerArr.data[0]?.totalRevenue,
    });
  } catch (error) {
    console.log("ERROR IN BANNER CONTROLLER");
    next(error);
  }
};

// export const cancelOrderById = async (req, res, next) => {
//   try {
//     const orderObj = await Order.findByIdAndUpdate(req.params.id, {
//       status: OrderStatus.CANCELLED,
//     })
//       .lean()
//       .exec();
//     res.status(200).json({ message: "Order Cancelled", success: true });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };
// export const updateStatusOrderById = async (req, res, next) => {
//   try {
//     let orderObj = await Order.findById(req.params.id).populate("productsArr.productId").lean().exec();
//     if (!orderObj) throw new Error("Order Not Found");
//     console.log(req.body, "---------------req.body-------------------------------");
//     // console.log(orderObj?.orderStatus,"------orderObjorderObjorderObjorderObjorderObj=============")

//     // console.log(orderObj?.userId,"orderObjorderObjorderObjorderObjorderObj=============")

//     let getUserEmail = await User.findById(orderObj?.userId).lean().exec();

//     let status = req.body.orderStatus;
//     if (!status) throw new Error("Status Not Valid");

//     await Order.findByIdAndUpdate(req.params.id, req.body).lean().exec();

//     let obj = {
//       status,
//       useEmail: "hello@wabisabistays.com",
//       orderObjId: orderObj.orderId ? "#" + getOrderIdSequence(orderObj.orderId) : orderObj._id,
//     };
//     let title = `Your Order status ${obj.orderObjId} has been Updated`;
//     let orderDispatchId = "";
//     if (req.body.orderStatus == "DISPATCHED") {
//       orderDispatchId = req.body.trackingId;
//     }
//     let subjet = `Your Order status has been ${status} here is the your order Id ${getOrderIdSequence(
//       orderObj.orderId,
//     )}`;
//     await sendMail(["hello@wabisabistays.com", getUserEmail?.email], title, subjet, false, orderDispatchId, false);
//     res.status(200).json({ message: "Order Status Updated Successfully", success: true });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };
// // export const generateInvoice = async (req, res, next) => {
// //     try {
// //         let orderObj = await Order.findById(req.params.id).lean().exec();
// //         if (!orderObj) throw new Error("Order Not Found");

// //         let invoiceUrl = `public/uploads/${orderObj._id}.pdf`;
// //         let displayInvoiceUrl = `uploads/${orderObj._id}.pdf`;

// //         await createInvoice(orderObj, invoiceUrl);
// //         // await setTimeout(async () => {
// //         //     await fs.unlink(invoiceUrl);
// //         // }, 10000);
// //         res.status(200).json({ message: "Invoice generated", data: displayInvoiceUrl, success: true });
// //     } catch (error) {
// //         console.error(error);
// //         next(error);
// //     }
// // };

// export const updateStatusHotelModelsInBulk = async (req, res, next) => {
//   try {
//     if (!req.body.status) {
//       throw new Error("Please Fill Order Status");
//     }

//     if (!req.body.orderId) {
//       throw new Error("Please Fill Order Id");
//     }

//     let productsArr = await Order.updateMany(
//       { _id: { $in: [...req.body.orderId.map((el) => `${el.orderId}`)] } },
//       { $set: { orderStatus: req.body.status } },
//     ).exec();
//     res.status(200).json({ message: "Bulk Status updated successfully", success: true });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };

export const updateOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await Order.findById(req.params.orderId).lean().exec();
    if (!existsCheck) {
      throw new Error("Order does not exists");
    }

    let Obj = await Order.findByIdAndUpdate(req.params.orderId, req.body).exec();
    res.status(201).json({ message: "Order Updated" });
  } catch (error) {
    next(error);
  }
};

export const addFoodBillPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    let pdfPath;

    let orderObj = await Order.findById(orderId).lean().exec();
    if (!orderObj) {
      return res.status(404).json({ message: "Booking Not Found", success: false });
    }

    if (req.body.foodBillPdf && req.body.foodBillPdf !== "") {
      pdfPath = await storeFileAndReturnNameBase64(req.body.foodBillPdf);
      if (orderObj.foodBillPdf && orderObj.foodBillPdf !== "") {
        deleteFileUsingUrl(`uploads/${orderObj.foodBillPdf}`);
      }
    }
    let foodBillPdf = await Order.findByIdAndUpdate(orderObj._id, { foodBillPdf: pdfPath }).lean().exec();
    return res.status(200).json({ message: "Food Bill PDF Added", success: true });
  } catch (error) {
    next(error);
  }
};

export const downloadFoodBillPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const isAdmin = req.query.isAdmin === "true";

    let orderObj = await Order.findById(orderId).lean().exec();
    if (!orderObj) {
      return res.status(404).json({ message: "Booking Not Found", success: false });
    }
    if (orderObj.foodBillPdf) {
      let pdfPath = path.join(__dirname, "../../../public/uploads", orderObj.foodBillPdf);
      return res.download(pdfPath, orderObj.foodBillPdf, (err) => {
        if (err) {
          next(err);
        }
      });
    } else {
      return res.status(404).json({ message: "Food Bill PDF Not Found", success: false });
    }
  } catch (error) {
    next(error);
  }
};

export const downloadInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const isAdmin = req.query.isAdmin === "true";

    let orderObj = await Order.findById(orderId).lean().exec();
    if (!orderObj) {
      return res.status(404).json({ message: "Booking Not Found", success: false });
    }

    const propertyData = await Property.find().lean().exec();

    if (orderObj.propertyId) {
      if (orderObj.hotelsArr && orderObj.hotelsArr.length > 0) {
        for (const property of propertyData) {
          const propertyId = property._id.toString();
          orderObj.hotelsArr = orderObj.hotelsArr.map((hotel) => {
            if (hotel.propertyId && hotel.propertyId.toString() === propertyId) {
              return { ...hotel, ...property };
            }
            return hotel;
          });
        }
      }
    }

    const fileName = `booking-confirmation-${orderId}.pdf`;

    const uploadDir = path.join(__dirname, "../../../public/uploads/bookings");
    const pdfPath = path.join(uploadDir, fileName);

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (dirError) {
      return res.status(500).json({
        message: "Failed to create directory for PDF",
        error: dirError instanceof Error ? dirError.message : "Unknown error",
        success: false,
      });
    }
    const role = req.user?.role;
    await createInvoice(orderObj, pdfPath, role);

    if (!fs.existsSync(pdfPath)) {
      return res.status(500).json({ message: "Failed to generate PDF", success: false });
    }

    return res.download(pdfPath, fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
      }
    });
  } catch (error) {
    next(error);
  }
};
