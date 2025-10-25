import { Schema, Types, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IEnquiry {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  status: string;
  remarks: string;
  locationvilla: string;
  message: string;
  statusnvilla: string;
  numberofroom: number;
  typeOfProperty: String;
  link: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const EnquirySchema = new Schema<IEnquiry>(
  {
    name: String,
    email: String,
    status: { type: String, default: "PENDING" },
    typeOfProperty: String,
    phone: String,
    message: String,
    remarks: String,
    locationvilla: String,
    statusnvilla: String,
    numberofroom: Number,
    link: String,
  },
  { timestamps: true },
);

export const Enquiry = model<IEnquiry>("enquiry", EnquirySchema);
