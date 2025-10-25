import { Document, Schema, Types, model } from "mongoose";

export interface IReview extends Document {
  name: string;
  propertyId: Types.ObjectId;
  date: Date;
  description: string;
  title: string;
  star: number;
  postedOn: string;
  thumbnail: string;
  isDeleted: boolean;
  status: string;
  top: string;
  home?: boolean;
}

const ReviewSchema = new Schema<IReview>(
  {
    propertyId: Types.ObjectId,
    name: {
      type: String,
      require: true,
    },
    date: Date,
    description: String,
    title: String,
    star: Number,
    postedOn: String,
    thumbnail: String,
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "active" },
    top: { type: String, default: "active" },
    home: { type: String, default: "active" },
  },
  { timestamps: true },
);

export const Review = model<IReview>("Reviews", ReviewSchema);
