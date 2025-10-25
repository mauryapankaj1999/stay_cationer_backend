import { Document, Schema, Types, model } from "mongoose";

export interface IFaqCategory extends Document {
  name: string;
  isDeleted: boolean;
  status: string;
}

const faqCategorySchema = new Schema<IFaqCategory>(
  {
    name: {
      type: String,
      require: true,
    },
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

export const FaqCategory = model<IFaqCategory>("faqCategorys", faqCategorySchema);
