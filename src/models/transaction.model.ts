import { Document, Schema, Types, model } from "mongoose";

export interface ITransaction extends Document {
  sellerId:Types.ObjectId,
  propertyId:Types.ObjectId,
  title: string;
  date:Date,
  description: string;
  amount:number;
  paymentType: string;
  paymentMethod: string;
  paidBy:string;
  isDeleted: boolean;
  status: string;
}

const transactionSchema = new Schema<ITransaction>(
  {
    sellerId:Types.ObjectId,
    propertyId:Types.ObjectId,
    title: String,
    description: String,
    paymentType: String,
    amount:Number,
    paymentMethod: String,
    date:Date,
    paidBy:String,
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

export const Transaction = model<ITransaction>("transactions", transactionSchema);
