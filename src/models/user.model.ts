import { APPROVE_STATUS, ROLES, ROLES_TYPE } from "common/constant.common";
import mongoose, { Document, Schema, Types, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  lastName: string;
  dob: string;
  name: string;
  gender: string;
  location: string;
  email: string;
  phone: string;
  password: string;
  stateId: Types.ObjectId;
  stateName: string;
  cityId: Types.ObjectId;
  cityName: string;
  address: string;
  pincode: string;
  isVerified: boolean;
  profileImage: string;
  gstNo: string;
  status: string;
  role: ROLES_TYPE;
  isDeleted: boolean;
  deletedOn: Date;
  createdAt: Date;
  updateAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const usersSchema = new Schema<IUser>(
  {
    fullName: String,
    lastName: String,
    name: String,
    email: String,
    dob: Date,
    gender: String,
    location: String,
    phone: String,
    password: String,
    profileImage: String,
    stateId: Types.ObjectId,
    stateName: String,
    cityId: Types.ObjectId,
    cityName: String,
    pincode: String,
    address: String,
    gstNo: String,
    role: {
      type: String,
      default: ROLES.USER,
    },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },
    status: { type: String, default: APPROVE_STATUS.APPROVED },
    // And `Schema.Types.ObjectId` in the schema definition.
  },
  { timestamps: true },
);

export const User = model<IUser>("users", usersSchema);
