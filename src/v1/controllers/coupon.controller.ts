import { COUPON_TYPE } from "common/constant.common";
import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Coupon, ICoupon } from "models/coupon.model";
import { Property } from "models/property.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    const requiredFields: any = {
      Name: name,
    };
    if (req.body.icon && req.body.icon.includes("base64")) {
      req.body.icon = await storeFileAndReturnNameBase64(req.body.icon);
    }
    verifyRequiredFields(requiredFields);

    await throwIfExist<ICoupon>(
      Coupon,
      {
        name: newRegExp(req.body.name),
      },
      ERROR.COUPON.EXIST,
    );

    const newCouponObj = {
      ...req.body,
    };

    const newCoupon: any = await createDocuments<ICoupon>(Coupon, newCouponObj);

    res.status(200).json({ message: MESSAGE.COUPON.CREATED, data: newCoupon._id });
  } catch (error) {
    console.log("ERROR IN COUPON CONTROLLER");
    next(error);
  }
};

export const getCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = {};
    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }
    if (req.query.show != undefined) {
      matchObj.show = Boolean(req.query.show);
    }
    if (req.query.status) {
      matchObj.status = "active";
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
    ];

    const eCouponArr = await paginateAggregate(Coupon, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.COUPON.ALLCOUPON, data: eCouponArr.data, total: eCouponArr.total });
  } catch (error) {
    console.log("ERROR IN COUPON CONTROLLER");
    next(error);
  }
};

export const getCouponById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eCoupon = await throwIfNotExist(Coupon, { _id: newObjectId(req.params.id) }, ERROR.COUPON.NOT_FOUND);
    const propertyArray = await Property.find({}, "name _id");

    res.status(200).json({ message: MESSAGE.COUPON.GOTBYID, data: eCoupon });
  } catch (error) {
    console.log("ERROR IN COUPON CONTROLLER");
    next(error);
  }
};

export const getPropertyForCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyArray = await Property.find({}, "name _id");

    const arr = { propertyArray };

    res.status(200).json({ message: "property array fetched  Successfully", data: arr });
  } catch (error) {
    console.log("ERROR IN COUPON CONTROLLER");
    next(error);
  }
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name }: ICoupon = req.body;

    let eCoupon: any = await throwIfNotExist(
      Coupon,
      {
        _id: newObjectId(req.params.id),
      },
      ERROR.COUPON.NOT_FOUND,
    );
    if (req.body.icon && req.body.icon.includes("base64")) {
      req.body.icon = await storeFileAndReturnNameBase64(req.body.icon);
    }
    if (name) {
      await throwIfExist(
        Coupon,
        {
          _id: { $ne: newObjectId(req.params.id) },

          name: newRegExp(name),
        },
        ERROR.COUPON.EXIST,
      );
    }

    let eCouponObjToUpdate = {
      ...req.body,
    };

    const updatedxpenseCategory = await findByIdAndUpdate<ICoupon>(
      Coupon,
      newObjectId(req.params.id),
      eCouponObjToUpdate,
      {
        new: true,
      },
    );

    res.status(200).json({ message: MESSAGE.COUPON.UPDATED, data: updatedxpenseCategory });
  } catch (error) {
    console.log("ERROR IN COUPON CONTROLLER");
    next(error);
  }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expenseCategory: ICoupon | any = await throwIfNotExist(
      Coupon,
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      ERROR.COUPON.NOT_FOUND,
    );

    const dataToSoftDelete = {
      isDeleted: true,
    };

    const obj = await Coupon.findByIdAndDelete(req.params.id).exec();

    res.status(200).json({ message: MESSAGE.COUPON.REMOVED });
  } catch (error) {
    console.log("ERROR IN COUPON CONTROLLER");
    next(error);
  }
};

export const checkValidCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let dicountObj: any = await Coupon.findOne({ name: new RegExp(`^${req.body.name}$`, "i"), status: "active" })
      .lean()
      .exec();
    if (!dicountObj) throw { status: 400, message: `Invalid discount code` };
    let today = new Date();
    let endDate = new Date(dicountObj?.expiryDate);
    endDate.setHours(23, 59, 59);

    let couponIsValid;
    let message = "";
    if (endDate.getTime() < today.getTime()) {
      couponIsValid = false;
      message = "Invalid coupon";
    }
    // else if ((dicountObj.usedBy >= dicountObj?.validFor)) {
    //     couponIsValid = false
    //     message = "Cannot be used further, used maximun number of times allowed"
    // }
    else if (dicountObj?.minimumCartValue > req.body.total) {
      couponIsValid = false;
      message = "Insufficient cart Value";
    } else {
      couponIsValid = true;
      message = "Coupon Applied";
      let amount = req.body.amount;
      if (dicountObj.type == COUPON_TYPE.PERCENTAGE) {
        let discoutAmount = Math.round((+amount * dicountObj.value) / 100);
        dicountObj.value = discoutAmount;
        let discountedAmount = Number(+amount) - Number(discoutAmount);
        dicountObj.discoutAmount = discountedAmount;
      }

      if (dicountObj.type == COUPON_TYPE.FLATOFF) {
        let discoutAmount = dicountObj.value;
        dicountObj.value = discoutAmount;
        let discountedAmount = Number(+amount) - Number(discoutAmount);
        dicountObj.discoutAmount = discountedAmount;
      }
    }

    res.status(200).json({ message: message, couponIsValid: couponIsValid, data: dicountObj, success: true });
  } catch (err) {
    next(err);
  }
};
