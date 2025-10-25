import { Document, Schema, Types, model } from "mongoose";

export type SectionProps = {
  title: string;
  description: string;
  image: string;
  url: string;
};
export interface IPage extends Document {
  name: string;
  type: string;
  section1: SectionProps;
  section2: SectionProps;
  section3: SectionProps[];
  section4: SectionProps;
  section5: SectionProps;
  isDeleted: boolean;
  status: string;
}

const PageSchema = new Schema<IPage>(
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

    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

export const Page = model<IPage>("Pages", PageSchema);
