import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Review, IReview } from "models/review.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const creatReview = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "REVIEW BODY");
  try {
    const { name, thumbnail } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IReview>(
      Review,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.REVIEW.EXIST,
    );

    const newReviewObj = {
      ...req.body,
    };

    if (thumbnail && typeof thumbnail === "string") {
      newReviewObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const newReview: any = await createDocuments<IReview>(Review, newReviewObj);

    res.status(200).json({ message: MESSAGE.REVIEW.CREATED, data: newReview._id });
  } catch (error) {
    console.log("ERROR IN REVIEW CONTROLLER");
    next(error);
  }
};

export const getReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    if (req.query.status) {
      matchObj.status = req.query.status;
    }

    if (req.query.top) {
      matchObj.top = req.query.top;
    }

    if (req.query.propertyId) {
      matchObj.propertyId = newObjectId(req.query.propertyId);
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

    const ReviewArr = await paginateAggregate(Review, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.REVIEW.ALLREVIEW, data: ReviewArr.data, total: ReviewArr.total });
  } catch (error) {
    console.log("ERROR IN REVIEW CONTROLLER");
    next(error);
  }
};

export const getReviewById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ReviewObj = await throwIfNotExist(
      Review,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.REVIEW.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.REVIEW.GOTBYID, data: ReviewObj });
  } catch (error) {
    console.log("ERROR IN REVIEW CONTROLLER");
    next(error);
  }
};

export const updatReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name, thumbnail }: IReview = req.body;

    let ReviewObj: any = await throwIfNotExist(
      Review,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.REVIEW.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        Review,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.REVIEW.EXIST,
      );
    }

    let ReviewObjToUpdate = {
      ...req.body,
    };

    if (thumbnail && thumbnail.includes("base64")) {
      ReviewObjToUpdate["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const updatedReview = await findByIdAndUpdate<IReview>(Review, newObjectId(req.params.id), ReviewObjToUpdate, {
      new: true,
    });

    res.status(200).json({ message: MESSAGE.REVIEW.UPDATED, data: updatedReview });
  } catch (error) {
    console.log("ERROR IN REVIEW CONTROLLER");
    next(error);
  }
};

export const deletReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await throwIfNotExist(
      Review,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.REVIEW.NOT_FOUND,
    );

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: MESSAGE.REVIEW.REMOVED });
  } catch (error) {
    console.log("ERROR IN REVIEW CONTROLLER");
    next(error);
  }
};
