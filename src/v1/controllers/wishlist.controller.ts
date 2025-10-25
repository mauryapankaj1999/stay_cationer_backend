import { Request, Response } from "express"
import { Wishlist } from "models/wishlist.model"
import { Types, Mongoose } from "mongoose"


export const addToWishlist = async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.body;

        console.log("req.body", req.body);
        console.log(req.user.userId, "check userId");

        const userId = req.user.userId;

        // console.log("req.body", req.body);
        const existing = await Wishlist.findOne({ userId, propertyId });
        if (existing) {
            const result = await Wishlist.findOneAndDelete({ userId, propertyId });

            if (!result) {
                return res.status(404).json({ message: "Item not found in wishlist" });
            }
            return res.status(200).json({ message: "Removed from wishlist" });
        }

        const newItem = await Wishlist.create({ userId, propertyId });
        return res.status(201).json({ message: "Added to wishlist", data: newItem });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
}

// export const removeFromWishlist = async (req: Request, res: Response) => {
//     try{
//         const {userId, propertyId} = req.body;
//         const result = await Wishlist.findOneAndDelete({userId, propertyId});
//         if(!result){
//             return res.status(404).json({ message: "Item not found in wishlist" });
//         }
//         return res.status(200).json({ message: "Removed from wishlist" });
//     }catch(error){
//         res.status(500).json({ message: "Internal server error", error });
//     }
// }

export const getUserWishlist = async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId;
        let matchObj = {
            userId: new Types.ObjectId(userId as string),
        }


        let pipeline = [
            {
                $match: matchObj
            },
            {
                $lookup: {
                    from: "propertys",
                    localField: "propertyId",
                    foreignField: "_id",
                    as: "data"
                }

            },
            {
                $lookup:
                {
                    from: "reviews",
                    localField: "propertyId",
                    foreignField: "propertyId",
                    as: "review"
                }
            }
        ]
        const item = await Wishlist.aggregate(pipeline);
        if (!item) {
            return res.status(404).json({ message: "No items found in wishlist" });
        }

        return res.status(200).json({ message: "Wishlist items", data: item });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
}

// export const isPropertyInWishlisted = async (req: Request, res: Response) => {
//     try{
//         const {userId, propertyId} = req.params;
//         const exist = await Wishlist.findOne({userId: new Types.ObjectId(userId as string), propertyId: new Types.ObjectId(propertyId as string)});
//         if(!exist){
//             return res.status(404).json({ message: "Property is not in the wishlist" });
//         }
//         return res.status(200).json({ message: "Property is in wishlist" });
//     }catch(error){
//         res.status(500).json({ message: "Internal server error", error });
//     }
// }