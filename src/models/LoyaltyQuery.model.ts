import { Schema, Types, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface ILoyaltyQuery {
  _id: Types.ObjectId;
  name: String;
  email: String;
  phone: String;
  city: String;
  travelType: String;
  dateOfBirth: Date;
  createdAt: Date;
  updateAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const LoyaltyQuerySchema = new Schema<ILoyaltyQuery>(
  {
    name: String,
    email: String,
    phone: String,
    city: String,
    travelType: String,
    dateOfBirth: Date,
    // And `Schema.Types.ObjectId` in the schema definition.
  },
  { timestamps: true },
);

export const LoyaltyQuery = model<ILoyaltyQuery>("loyaltyQuery", LoyaltyQuerySchema);
