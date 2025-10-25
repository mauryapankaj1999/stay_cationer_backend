import { model, Model, Schema, Types } from "mongoose";

export interface IOTP {
  phone: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

const OTPSchema = new Schema<IOTP>({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    expires: 600, // 10 minutes in seconds
  },
});
export const OTP = model<IOTP>("OTP", OTPSchema);
