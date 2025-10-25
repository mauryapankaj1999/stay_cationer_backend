import { COUPON_TYPE } from "common/constant.common";
import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { deleteFileUsingUrl, storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Reels, IReels } from "models/reels.model";
import { Property } from "models/property.model";
import mongoose, { PipelineStage, Types } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const createReels = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "Reel BODY");
  try {
    const { title } = req.body;

    console.log(title, "check title ");

    // const requiredFields: any = {
    //   Title: title,
    // };

    // verifyRequiredFields(requiredFields);

    await throwIfExist<IReels>(
      Reels,
      {
        title: newRegExp(req.body.title),
      },
      ERROR.COUPON.EXIST,
    );

    if (req?.body && req?.body?.video && req?.body?.video.includes("base64")) {
      req.body.video = await storeFileAndReturnNameBase64(req.body.video);
    }
    if (req?.body && req?.body?.thumbnail && req?.body?.thumbnail.includes("base64")) {
      req.body.thumbnail = await storeFileAndReturnNameBase64(req.body.thumbnail);
    }

    const newReelsObj = {
      ...req.body,
    };
    console.log(newReelsObj, "check new reels obj");
    const newReels: any = await createDocuments<IReels>(Reels, newReelsObj);

    console.log(req.body.video.includes("base64"), "check video");

    // const reels = await new Reels(req.body).save();

    res.status(200).json({ message: "Reel Created", data: newReels._id });
  } catch (error) {
    console.log("ERROR IN Reel CONTROLLER");
    next(error);
  }
};

export const getReels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = {};

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    if (req.query.propertyId && req.query.propertyId !== "") {
      matchObj.propertyId = new mongoose.Types.ObjectId(`${req.query.propertyId}`);
    }
    if (req.query.destinationId && req.query.destinationId !== "") {
      matchObj.destinationId = new mongoose.Types.ObjectId(`${req.query.destinationId}`);
    }



    if (req.query.show != undefined) {
      matchObj.show = Boolean(req.query.show);
    }
    if (req.query.status) {
      matchObj.status = req.query.status;
    }
    if (req.query.location && req.query.location !== "") {
      matchObj.destinationId = new mongoose.Types.ObjectId(`${req.query.location}`);
    }
    if (req.query.stateId) {
      matchObj.stateId = new mongoose.Types.ObjectId(`${req.query.stateId}`);
    }
    let pipeline: PipelineStage[] = [
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: matchObj,
      },
      {
        $lookup: {
          from: "propertys",
          localField: "propertyId",
          foreignField: "_id",
          as: "propertyObj",
        },
      },
      {
        $unwind: {
          path: "$propertyObj",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "destinations",
          localField: "destinationId",
          foreignField: "_id",
          as: "destinationObj",
        },
      },
      {
        $unwind: {
          path: "$destinationObj",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const eReelsArr = await paginateAggregate(Reels, pipeline, req.query);

    res.status(200).json({ message: "Reels Created", data: eReelsArr.data, total: eReelsArr.total });
  } catch (error) {
    console.log("ERROR IN reels CONTROLLER");
    next(error);
  }
};

export const getReelsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eReels = await throwIfNotExist(Reels, { _id: newObjectId(req.params.id) }, ERROR.COUPON.NOT_FOUND);

    res.status(200).json({ message: "got reels by id", data: eReels });
  } catch (error) {
    console.log("ERROR IN Reels CONTROLLER");
    next(error);
  }
};

export const updateReels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existingReels = await Reels.findById(new mongoose.Types.ObjectId(req.params.id)).lean().exec();
    if (req.body.video && req.body.video.includes("base64")) {
      if (existingReels?.video) {
        await deleteFileUsingUrl(existingReels.video);
      }
      req.body.video = await storeFileAndReturnNameBase64(req.body.video);
    }
    if (req.body.thumbnail && req.body.thumbnail.includes("base64")) {
      if (existingReels?.video) {
        await deleteFileUsingUrl(existingReels.video);
      }
      req.body.thumbnail = await storeFileAndReturnNameBase64(req.body.thumbnail);
    }
    console.log(req.body, "check req body");
    const updatedReels = await Reels.findByIdAndUpdate(new mongoose.Types.ObjectId(req.params.id), req.body, {
      new: true,
    });
    console.log(updatedReels, "check updated reels");
    res.status(200).json({ message: "Reels Updated" });
  } catch (error) {
    console.log("ERROR IN reels CONTROLLER");
    next(error);
  }
};

export const deleteReels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expenseCategory: IReels | any = await throwIfNotExist(
      Reels,
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      ERROR.COUPON.NOT_FOUND,
    );

    const dataToSoftDelete = {
      isDeleted: true,
    };

    const obj = await Reels.findByIdAndDelete(req.params.id).exec();

    res.status(200).json({ message: "Reels Deleted" });
  } catch (error) {
    console.log("ERROR IN reels CONTROLLER");
    next(error);
  }
};

// export const checkValidReels = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     let dicountObj: any = await Reels.findOne({ title: new RegExp(`^${req.body.title}$`, "i"), status: "active" })
//       .lean()
//       .exec();
//     if (!dicountObj) throw { status: 400, message: `Invalid discount code` };
//     let today = new Date();
//     let endDate = new Date(dicountObj?.expiryDate);
//     endDate.setHours(23, 59, 59);

//     let reelsIsValid;
//     let message = "";
//     if (endDate.getTime() < today.getTime()) {
//       reelsIsValid = false;
//       message = "Invalid reels";
//     }
//     // else if ((dicountObj.usedBy >= dicountObj?.validFor)) {
//     //     reelsIsValid = false
//     //     message = "Cannot be used further, used maximun number of times allowed"
//     // }
//     else if (dicountObj?.minimumCartValue > req.body.total) {
//       reelsIsValid = false;
//       message = "Insufficient cart Value";
//     } else {
//       reelsIsValid = true;
//       message = "Reels Applied";
//       let amount = req.body.amount;
//       if (dicountObj.type == COUPON_TYPE.PERCENTAGE) {
//         let discoutAmount = Math.round((+amount * dicountObj.value) / 100);
//         dicountObj.value = discoutAmount;
//         let discountedAmount = Number(+amount) - Number(discoutAmount);
//         dicountObj.discoutAmount = discountedAmount;
//       }

//       if (dicountObj.type == COUPON_TYPE.FLATOFF) {
//         let discoutAmount = dicountObj.value;
//         dicountObj.value = discoutAmount;
//         let discountedAmount = Number(+amount) - Number(discoutAmount);
//         dicountObj.discoutAmount = discountedAmount;
//       }
//     }

//     res.status(200).json({ message: message, reelsIsValid: reelsIsValid, data: dicountObj, success: true });
//   } catch (err) {
//     next(err);
//   }
// };
