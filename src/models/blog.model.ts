import { Document, Schema, Types, model } from "mongoose";

export interface IBlog extends Document {
  name: string;

  description: string;
  author: string;
  views: number;
  date: Date;
  thumbnail: string;
  isDeleted: boolean;
  status: string;
  top: string;
}

const BlogSchema = new Schema<IBlog>(
  {
    name: {
      type: String,
      require: true,
    },
    thumbnail: String,
    description: String,
    author: String,
    date: Date,
    views: Number,

    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "active" },
    top: { type: String, default: "active" },
  },
  { timestamps: true },
);

export const Blog = model<IBlog>("Blogs", BlogSchema);
