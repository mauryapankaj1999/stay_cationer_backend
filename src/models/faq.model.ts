import { Document, Schema, Types, model } from "mongoose";

export interface IFaq extends Document {
  _id: Types.ObjectId;
  name: string;
  thumbnail: string;
  faqCategoryId: Types.ObjectId;
  faqCategoryName: string;
  description: string;
  status: string;
  isDeleted:boolean
}

const faqSchema = new Schema<IFaq>(
  {
    name: String,
    description: String,
    thumbnail: String,
    faqCategoryId: Types.ObjectId,
    faqCategoryName: String,
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

export const Faq = model<IFaq>("faqs", faqSchema);
