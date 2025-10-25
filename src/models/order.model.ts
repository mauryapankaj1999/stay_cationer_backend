import { ORDER_STATUS } from "common/constant.common";
import { Document, Schema, Types, model } from "mongoose";

export interface IOrder extends Document {
  _id: Types.ObjectId;
  name: string;
  mobile: string;
  email: string;
  gstNo: string;
  bookingAmount: number;
  amountReceived: number;
  amountDue: number;
  message: string;
  paymentType: string;
  nights: string;
  adult: string;
  child: string;
  startDate: Date;
  endDate: Date;
  userId: string;
  propertyId: Types.ObjectId;
  sellerId: Types.ObjectId;
  hotelsArr: Hotel[];
  gst: Gst;
  subTotalAmount: number;
  commission: number;
  totalAmount: number;
  orderStatus: string;
  orderStatusArr: OrderStatusItem[];
  bookingstatus: string;
  dicountObj: DiscountObj;
  paymentObj: PaymentObj;
  active: boolean;
  orderNotes: string;
  note: string;
  doc: string;
  adminNote: string;
  foodBillPdf: string;
  bookingVia?: string;
  noOfPets?: string;
  increaseAmountBy?: number;
}

interface Hotel {
  propertyId: Types.ObjectId;
  price: number;
  name: string;
  image: string;
}

interface Gst {
  tax: number;
  amount: number;
  baseAmount?: number;
}

interface OrderStatusItem {
  orderStatus: string;
  updatedOn: string;
}

export interface DiscountObj {
  code: string;
  amount: number;
}

interface PaymentObj {
  paymentId: string;
  gatwayPaymentObj: any;
  amountPayedFromWallet: number;
  paymentChk: number;
}

const orderSchema = new Schema<IOrder>(
  {
    name: String,
    mobile: String,
    email: String,
    gstNo: String,
    message: String,
    nights: String,
    adult: String,
    paymentType: String,
    bookingAmount: Number,
    amountReceived: Number,
    amountDue: Number,
    bookingstatus: String,
    child: String,
    startDate: Date,
    endDate: Date,
    userId: Types.ObjectId,
    propertyId: Types.ObjectId,
    sellerId: Types.ObjectId,
    foodBillPdf: String,
    commission: Number,

    hotelsArr: [
      {
        propertyId: Types.ObjectId,
        price: Number,
        name: String,
        image: String,
      },
    ],
    gst: {
      tax: {
        type: Number,
        default: 0,
      },
      amount: {
        type: Number,
        default: 0,
      },
      baseAmount: {
        type: Number,
        default: 0,
      },
    },
    subTotalAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    orderStatus: {
      type: String,
      default: ORDER_STATUS.PENDING,
    },
    orderStatusArr: [
      {
        orderStatus: String,
        updatedOn: String,
      },
    ],

    dicountObj: {
      code: String,
      amount: Number,
    },
    paymentObj: {
      paymentId: String,
      gatwayPaymentObj: Object, // razorpay
      amountPayedFromWallet: {
        type: Number,
        default: 0,
      },
      paymentChk: {
        // 0 means payment has not occured ,1 means payment successful, -1 means payment failed ,2 for cod
        type: Number, //  this will also be 1 if the payableamount is 0
        default: 0, // if payment is not 1 then it wont be able to proceed
      },
    },
    active: {
      type: Boolean,
      default: false,
    },
    bookingVia: {
      type: String,
      default: "",
    },
    noOfPets: {
      type: String,
      default: "",
    },
    increaseAmountBy: {
      type: Number,
      default: 0,
    },
    orderNotes: String,
    note: String,
    doc: String,
    adminNote: String,
  },
  { timestamps: true },
);

export const Order = model<IOrder>("orders", orderSchema);
