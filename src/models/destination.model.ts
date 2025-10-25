import { Document, Schema, Types, model } from "mongoose";

export interface IDestination extends Document {
  name: string;
  slug: string;
  thumbnail: string;
  isDeleted: boolean;
  isTop: boolean;
  status: string;
}

const DestinationSchema = new Schema<IDestination>(
  {
    name: {
      type: String,
      require: true,
    },
    thumbnail: String,
    slug: String,
    isDeleted: { type: Boolean, default: false },
    isTop: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

export const Destination = model<IDestination>("Destinations", DestinationSchema);
