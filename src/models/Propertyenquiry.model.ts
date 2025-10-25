import { Schema, Types, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IPropertyEnuiry {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  name: String;
  mobile: String;
  status: String;
  email: String;
  message: String;
  createdAt: Date;
  remarks: String;
  updateAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const PropertyEnuirySchema = new Schema<IPropertyEnuiry>(
  {
    propertyId: Types.ObjectId, // Changed from Types.ObjectId to String for propertyId
    name: String,
    status: String, // Added status field
    mobile: String, // Changed from number to String for mobile
    email: String,
    remarks: String, // Added remarks field
    message: String,
    // And `Schema.Types.ObjectId` in the schema definition.
  },
  { timestamps: true },
);

export const PropertyEnuiry = model<IPropertyEnuiry>("PropertyEnquiry", PropertyEnuirySchema);
