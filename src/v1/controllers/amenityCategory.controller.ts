import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { AmenityCategory, IAmenityCategory } from "models/amenityCategory.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const createAmenityCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IAmenityCategory>(
      AmenityCategory,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.AMENITYCATEGORY.EXIST,
    );

    const newAmenityCategoryObj = {
      ...req.body,
    };

    const newAmenityCategory: any = await createDocuments<IAmenityCategory>(AmenityCategory, newAmenityCategoryObj);

    res.status(200).json({ message: MESSAGE.AMENITYCATEGORY.CREATED, data: newAmenityCategory._id });
  } catch (error) {
    next(error);
  }
};

export const getAmenityCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    let pipeline: PipelineStage[] = [
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $match: matchObj,
      },
    ];

    if (req.query.amenity === "true") {
      pipeline.push(
        {
          $match: {
            status: "active",
          },
        },
        {
          $lookup: {
            from: "amenitys",
            localField: "_id",
            foreignField: "amenityCategoryId",
            as: "amenitys",
            pipeline: [
              {
                $match: {
                  status: "active",
                },
              },
              {
                $unset: [
                  "amenityCategoryName",
                  "isDeleted",
                  "thumbnail",
                  "status",
                  "createdAt",
                  "updatedAt",
                  "amenityCategoryId",
                ],
              },
            ],
          },
        },
        {
          $match: {
            $expr: { $gt: [{ $size: "$amenitys" }, 0] },
          },
        },
      );
    }

    const eAmenityCategoryArr = await paginateAggregate(AmenityCategory, pipeline, req.query);

    res.status(200).json({
      message: MESSAGE.AMENITYCATEGORY.ALLAMENITYCATEGORY,
      data: eAmenityCategoryArr.data,
      total: eAmenityCategoryArr.total,
    });
  } catch (error) {
    console.log("ERROR IN AMENITYCATEGORY CONTROLLER");
    next(error);
  }
};

export const getAmenityCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eAmenityCategory = await throwIfNotExist(
      AmenityCategory,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.AMENITYCATEGORY.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.AMENITYCATEGORY.GOTBYID, data: eAmenityCategory });
  } catch (error) {
    console.log("ERROR IN AMENITYCATEGORY CONTROLLER");
    next(error);
  }
};

export const updateAmenityCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name }: IAmenityCategory = req.body;

    let eAmenityCategory: any = await throwIfNotExist(
      AmenityCategory,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.AMENITYCATEGORY.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        AmenityCategory,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.AMENITYCATEGORY.EXIST,
      );
    }

    let eAmenityCategoryObjToUpdate = {
      ...req.body,
    };

    const updatedxpenseCategory = await findByIdAndUpdate<IAmenityCategory>(
      AmenityCategory,
      newObjectId(req.params.id),
      eAmenityCategoryObjToUpdate,
      {
        new: true,
      },
    );

    res.status(200).json({ message: MESSAGE.AMENITYCATEGORY.UPDATED, data: updatedxpenseCategory });
  } catch (error) {
    console.log("ERROR IN AMENITYCATEGORY CONTROLLER");
    next(error);
  }
};

export const deleteAmenityCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expenseCategory: IAmenityCategory | any = await throwIfNotExist(
      AmenityCategory,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.AMENITYCATEGORY.NOT_FOUND,
    );

    const dataToSoftDelete = {
      isDeleted: true,
    };

    await findByIdAndUpdate(AmenityCategory, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.AMENITYCATEGORY.REMOVED });
  } catch (error) {
    console.log("ERROR IN AMENITYCATEGORY CONTROLLER");
    next(error);
  }
};
