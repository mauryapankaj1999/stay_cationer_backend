import { Schema, Types, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface ISubscribe {
  _id: Types.ObjectId;
  Email: string;
  createdAt: Date;
  updateAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const SubscribeSchema = new Schema<ISubscribe>(
  {
    Email: String,
    // And `Schema.Types.ObjectId` in the schema definition.
  },
  { timestamps: true },
);

export const Subscribe = model<ISubscribe>("Subscribe", SubscribeSchema);
