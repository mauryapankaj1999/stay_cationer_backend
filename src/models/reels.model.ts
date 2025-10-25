import { Document, Schema, Types, model } from "mongoose";

export interface IReels extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  video: string;
  propertyId: Types.ObjectId;
  thumbnail: string;
  destinationId: Types.ObjectId;
}

const reelsSchema = new Schema<IReels>(
  {
    title: String,
    description: String,
    thumbnail: String,
    propertyId: Types.ObjectId,
    video: String,
    destinationId: Types.ObjectId,
  },
  { timestamps: true },
);

export const Reels = model<IReels>("reels", reelsSchema);
