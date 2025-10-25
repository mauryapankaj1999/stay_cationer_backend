import { Document, Schema, Types, model } from "mongoose";

export interface ICoupon extends Document {
  type: string;
  description: string;
  expiryDate: Date;
  icon: string;
  value: number;
  name: string;
  usedBy: {
    type: number;
    default: 0;
  };
  validFor: number;
  image: string;
  minimumCartValue: number;
  status: string;
  show: boolean;
}

const couponSchema = new Schema<ICoupon>(
  {
    type: String,
    icon: String,
    description: String,
    expiryDate: { type: Date },
    value: Number,
    name: { type: String },
    usedBy: {
      type: Number,
      default: 0,
    },
    validFor: Number,
    image: String,
    minimumCartValue: Number,
    show: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

export const Coupon = model<ICoupon>("coupons", couponSchema);
