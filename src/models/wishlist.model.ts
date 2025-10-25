import { APPROVE_STATUS } from "common/constant.common";
import { Document, Schema, Types, model } from "mongoose";

export interface IWishlist {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    propertyId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
    {
        userId: Types.ObjectId,
        propertyId: Types.ObjectId,
    },
    {timestamps: true}
)

export const Wishlist = model<IWishlist>("Wishlist", WishlistSchema);