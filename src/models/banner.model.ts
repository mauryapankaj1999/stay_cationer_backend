import { Document, Schema, Types, model } from "mongoose";

export interface IBanner extends Document {
  name: string;
  thumbnail: string;
  isDeleted: boolean;
  status: string;
}

const BannerSchema = new Schema<IBanner>(
  {
    name: {
      type: String,
      require: true,
    },
    thumbnail: String,
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

export const Banner = model<IBanner>("Banners", BannerSchema);
