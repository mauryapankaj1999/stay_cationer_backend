import mongoose, { Schema, Types, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface ICity {
  _id: Types.ObjectId;
  name: string;
  stateId: mongoose.Types.ObjectId;
  status: boolean;
  createdAt: Date;
  updateAt: Date;
}

const citiesSchema = new Schema<ICity>(
  {
    name: String,
    stateId: mongoose.Types.ObjectId,
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const City = model<ICity>("cities", citiesSchema);
