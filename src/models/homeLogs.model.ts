import { Schema, Types, model } from "mongoose";
import { IPage } from "./page.model";

// 1. Create an interface representing a document in MongoDB.

// 2. Create a Schema corresponding to the document interface.
const HomeLogsSchema = new Schema<IPage>(
  {
    name: {
      type: String,
      require: true,
    },
    type: String,
    section1: {
      title: String,
      description: String,
      image: String,
      url: String,
    },
    section2: {
      title: String,
      description: String,
      image: String,
      url: String,
    },
    section3: [
      {
        title: String,
        description: String,
        image: String,
        url: String,
      },
    ],
    section4: {
      title: String,
      description: String,
      image: String,
      url: String,
    },
    section5: {
      title: String,

      image: String,
    },

    status: { type: String, default: "active" },
    // And `Schema.Types.ObjectId` in the schema definition.
  },
  { timestamps: true },
);

export const HomeLogs = model<IPage>("HomeLog", HomeLogsSchema);
