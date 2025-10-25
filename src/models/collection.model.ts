import { Document, Schema, Types, model } from "mongoose";

export interface ICollection extends Document {
  name: string;
  slug: string;
  thumbnail: string;
  isDeleted: boolean;
  status: string;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      require: true,
    },
    thumbnail: String,
    slug: String,
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

export const Collection = model<ICollection>("Collections", CollectionSchema);
