import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Reel, IReel } from "models/reel.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const creatReel = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "REVIEW BODY");
  try {
    const { name, thumbnail } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IReel>(
      Reel,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.REVIEW.EXIST,
    );

    const newReelObj = {
      ...req.body,
    };

    if (thumbnail && typeof thumbnail === "string") {
      newReelObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const newReel: any = await createDocuments<IReel>(Reel, newReelObj);

    res.status(200).json({ message: MESSAGE.REVIEW.CREATED, data: newReel._id });
  } catch (error) {
    console.log("ERROR IN REVIEW CONTROLLER");
    next(error);
  }
};

export const getReel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
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

    const ReelArr = await paginateAggregate(Reel, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.REVIEW.ALLREVIEW, data: ReelArr.data, total: ReelArr.total });
  } catch (error) {
    console.log("ERROR IN REVIEW CONTROLLER");
    next(error);
  }
};

export const getReelById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ReelObj = await throwIfNotExist(
      Reel,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.REVIEW.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.REVIEW.GOTBYID, data: ReelObj });
  } catch (error) {
    console.log("ERROR IN REVIEW CONTROLLER");
    next(error);
  }
};

export const updatReel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name, thumbnail }: IReel = req.body;
    console.log(req.body, "REVIEW BODY");
    let ReelObj: any = await throwIfNotExist(
      Reel,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.REVIEW.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        Reel,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.REVIEW.EXIST,
      );
    }

    let ReelObjToUpdate = {
      ...req.body,
    };

    if (thumbnail && thumbnail.includes("base64")) {
      ReelObjToUpdate["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const updatedReel = await findByIdAndUpdate<IReel>(Reel, newObjectId(req.params.id), ReelObjToUpdate, {
      new: true,
    });

    res.status(200).json({ message: MESSAGE.REVIEW.UPDATED, data: updatedReel });
  } catch (error) {
    console.log("ERROR IN REVIEW CONTROLLER");
    next(error);
  }
};

export const deletReel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ReelObj: IReel | any = await throwIfNotExist(
      Reel,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.REVIEW.NOT_FOUND,
    );
    const dataToSoftDelete = {
      isDeleted: true,
    };

    await findByIdAndUpdate(Reel, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.REVIEW.REMOVED });
  } catch (error) {
    console.log("ERROR IN REVIEW CONTROLLER");
    next(error);
  }
};
