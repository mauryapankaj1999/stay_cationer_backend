import { APPROVE_STATUS } from "common/constant.common";
import { Document, Schema, Types, model } from "mongoose";

export interface IProperty extends Document {
  _id: Types.ObjectId;
  sellerId: Types.ObjectId;
  name: string;
  Infromation: string;
  slug: string;
  title: string;
  pdf: String;
  group: string[];
  support: string;
  hassle: boolean;
  bedroom: number;
  bathroom: number;
  guest: number;
  serviceType: string;
  maxGuest: number;
  amenities: {
    amenityCategoryName: string;
    amenityCategoryId: Types.ObjectId;
    name: string;
    amenityId: Types.ObjectId;
    _id: 0;
  }[];
  collections: [Types.ObjectId];
  guestPriceArr: {
    _id: 0;
    price: number;
  }[];
  description: string;
  collectionId: Types.ObjectId;
  destinationId: Types.ObjectId;
  mainImage: string;
  area: string;
  address: string;
  map: string;
  price: number;
  mealImage: string;
  nonVegMenuImage: string;
  viewMore: string;
  mixMenuImage: string;
  todos: string;
  meals: {
    _id: 0;
    name: string;
    priceArr: {
      _id: 0;
      name: string;
      price: number;
    }[];
  }[];
  galleries: {
    _id: 0;
    name: string;
    imageList: [];
  }[];
  rooms: {
    _id: 0;
    title: string;
    description: string;
    image: string;
  }[];
  propertyRules: string;
  faqs: {
    _id: 0;
    question: string;
    answer: string;
  }[];
  isDeleted: boolean;
  status: string;
  top: string;
}

const PropertySchema = new Schema<IProperty>(
  {
    sellerId: Types.ObjectId,
    pdf: String,
    hassle: Boolean,
    Infromation: String,
    name: {
      type: String,
      require: true,
    },
    support: String,
    title: String,
    slug: String,
    group: [String],
    serviceType: String,
    mainImage: String,
    mealImage: String,
    nonVegMenuImage: String,
    mixMenuImage: String,
    viewMore: String,
    bedroom: Number,
    bathroom: Number,
    guest: Number,
    maxGuest: Number,
    todos: String,
    collections: [Types.ObjectId],
    guestPriceArr: [
      {
        _id: 0,
        price: Number,
      },
    ],
    amenities: [
      {
        amenityCategoryName: String,
        amenityCategoryId: Types.ObjectId,
        name: String,
        amenityId: Types.ObjectId,
        _id: 0,
      },
    ],
    description: String,
    collectionId: Types.ObjectId,
    destinationId: Types.ObjectId,
    area: String,
    address: String,
    map: String,
    price: Number,
    meals: [
      {
        _id: 0,
        name: String,
        priceArr: [
          {
            name: String,
            price: Number,
          },
        ],
      },
    ],
    galleries: [
      {
        _id: 0,
        name: String,
        imageList: [],
      },
    ],
    rooms: [
      {
        _id: 0,
        title: String,
        description: String,
        image: String,
      },
    ],
    propertyRules: String,
    faqs: [
      {
        _id: 0,
        question: String,
        answer: String,
      },
    ],
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: APPROVE_STATUS.PENDING },
    top: { type: String, default: "inactive" },
  },
  { timestamps: true },
);

export const Property = model<IProperty>("Propertys", PropertySchema);
