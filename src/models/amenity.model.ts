import { Document, Schema, Types, model } from "mongoose";

export interface IAmenity extends Document {
  _id: Types.ObjectId;
  name: string;
  thumbnail: string;
  amenityCategoryId: Types.ObjectId;
  amenityCategoryName: string;
  description: string;
  status: string;
  isDeleted:boolean
}

const amenitySchema = new Schema<IAmenity>(
  {
    name: String,
    description: String,
    thumbnail: String,
    amenityCategoryId: Types.ObjectId,
    amenityCategoryName: String,
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

export const Amenity = model<IAmenity>("amenitys", amenitySchema);
