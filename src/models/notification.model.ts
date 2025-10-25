import { Schema, Types, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface Inotification {
  _id: Types.ObjectId;
  link: string;
  userName: string;
  text: string;
  id: Types.ObjectId;
  createdAt: Date;
  updateAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const notificationSchema = new Schema<Inotification>(
  {
    text: String,
    link: String,
    userName: String,
    id: Types.ObjectId, // This can be a string or ObjectId depending on your use case.
    // And `Schema.Types.ObjectId` in the schema definition.
  },
  { timestamps: true },
);

export const notification = model<Inotification>("notification", notificationSchema);
