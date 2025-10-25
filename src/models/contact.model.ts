import { Schema, Types, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IContact {
  _id: Types.ObjectId;
  fname: string;
  concern: string;
  email: string;
  phone: string;
  remarks: string;
  status: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const ContactSchema = new Schema<IContact>(
  {
    email: String,
    phone: String,
    remarks: String,
    status: String,
    fname: String,
    concern: String,
    message: String,
  },
  { timestamps: true },
);

export const Contact = model<IContact>("contactEnquiry", ContactSchema);
