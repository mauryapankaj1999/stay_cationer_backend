import { Schema, Types, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface ICreateGift {
  _id: Types.ObjectId;
  sender: {
    name: string;
    email: string;
    phone: string;
  };
  receiver: {
    name?: string;
    email?: string;
    phone?: string;
  };
  amount: number;
  title: string;
  message: string;
  createdAt: Date;
  updateAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const CreateGiftSchema = new Schema<ICreateGift>(
  {
    sender: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    receiver: {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
    amount: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const CreateGift = model<ICreateGift>("CreateGift", CreateGiftSchema);
