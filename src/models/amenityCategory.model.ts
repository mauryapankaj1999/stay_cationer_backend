import { Document, Schema, Types, model } from "mongoose";

export interface IAmenityCategory extends Document {
  name: string;
  isDeleted: boolean;
  status: string;
}

const amenityCategorySchema = new Schema<IAmenityCategory>(
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

export const AmenityCategory = model<IAmenityCategory>("amenityCategorys", amenityCategorySchema);
