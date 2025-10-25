import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Banner, IBanner } from "models/banner.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const creatBanner = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "BANNER BODY");
  try {
    const { name, thumbnail } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IBanner>(
      Banner,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.BANNER.EXIST,
    );

    const newBannerObj = {
      ...req.body,
    };

    if (thumbnail && typeof thumbnail === "string") {
      newBannerObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const newBanner: any = await createDocuments<IBanner>(Banner, newBannerObj);

    res.status(200).json({ message: MESSAGE.BANNER.CREATED, data: newBanner._id });
  } catch (error) {
    console.log("ERROR IN BANNER CONTROLLER");
    next(error);
  }
};

export const getBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    if (req.query.status) {
      matchObj.status = req.query.status;
    }

    let pipeline: PipelineStage[] = [
      {
        $sort: {
          createdAt:-1
        }
      },
      {
        $match: matchObj,
      },
    ];

    const BannerArr = await paginateAggregate(Banner, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.BANNER.ALLBANNER, data: BannerArr.data, total: BannerArr.total });
  } catch (error) {
    console.log("ERROR IN BANNER CONTROLLER");
    next(error);
  }
};

export const getBannerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const BannerObj = await throwIfNotExist(
      Banner,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.BANNER.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.BANNER.GOTBYID, data: BannerObj });
  } catch (error) {
    console.log("ERROR IN BANNER CONTROLLER");
    next(error);
  }
};

export const updatBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name, thumbnail }: IBanner = req.body;

    let BannerObj: any = await throwIfNotExist(
      Banner,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.BANNER.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        Banner,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.BANNER.EXIST,
      );
    }

    let BannerObjToUpdate = {
      ...req.body,
      
    };

    if (thumbnail && thumbnail.includes("base64")) {
      BannerObjToUpdate["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const updatedBanner = await findByIdAndUpdate<IBanner>(Banner, newObjectId(req.params.id), BannerObjToUpdate, {
      new: true,
    });

    res.status(200).json({ message: MESSAGE.BANNER.UPDATED, data: updatedBanner });
  } catch (error) {
    console.log("ERROR IN BANNER CONTROLLER");
    next(error);
  }
};

export const deletBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const BannerObj: IBanner | any = await throwIfNotExist(
      Banner,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.BANNER.NOT_FOUND,
    );
    const dataToSoftDelete = {
      isDeleted: true,
    };

    await findByIdAndUpdate(Banner, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.BANNER.REMOVED });
  } catch (error) {
    console.log("ERROR IN BANNER CONTROLLER");
    next(error);
  }
};
