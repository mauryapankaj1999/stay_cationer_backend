import mongoose, { Schema, Types, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IState {
  _id: Types.ObjectId;
  name: string;
  status: boolean;
  createdAt: Date;
  updateAt: Date;
}

const statesSchema = new Schema<IState>(
  {
    name: String,
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const State =
  mongoose.models.State || model<IState>("states", statesSchema);
