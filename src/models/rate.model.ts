import { Document, Schema, Types, model } from "mongoose";

export interface IRate extends Document {
  name: string;
  propertyId: Types.ObjectId;
  orderId: Types.ObjectId;
  price: number;
  date: Date;
  maxGuest: number;
  isAvailable: boolean;
}

const RateSchema = new Schema<IRate>(
  {
    propertyId: Types.ObjectId,
    orderId: Types.ObjectId,
    name: {
      type: String,
      require: true,
    },
    date: Date,
    price: Number,
    maxGuest: Number,
    isAvailable: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Rate = model<IRate>("Rates", RateSchema);
