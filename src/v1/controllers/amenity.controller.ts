import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { RequestHandler } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Amenity, IAmenity } from "models/amenity.model";
import { IUser, User } from "models/user.model";
import { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import {
  createDocuments,
  findByIdAndUpdate,
  newObjectId,
  throwIfExist,
  throwIfNotExist,
  updateMany,
} from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const AmenityAdd: RequestHandler = async (req, res, next) => {
  try {
    const { name, thumbnail } = req.body;

    const requiredFields = { Name: name };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IAmenity>(
      Amenity,
      {
        name: newRegExp(name),
        isDeleted: false,
      },
      ERROR.AMENITY.EXIST,
    );

    const newAmenityObj = {
      ...req.body,
    };

    if (thumbnail && typeof thumbnail === "string") {
      newAmenityObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const data: any = await createDocuments(Amenity, newAmenityObj);

    res.status(201).json({ message: MESSAGE.AMENITY.CREATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const AmenityGet: RequestHandler = async (req, res, next) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    if (req.query.amenityCategoryId) {
      matchObj.amenityCategoryId = newObjectId(req.query.amenityCategoryId);
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

    const data = await paginateAggregate(Amenity, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.AMENITY.ALLAMENITY, data: data.data, total: data.total });
  } catch (error) {
    next(error);
  }
};

export const AmenityGetById: RequestHandler = async (req, res, next) => {
  try {
    const data = await throwIfNotExist(
      Amenity,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.AMENITY.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.AMENITY.GOTBYID, data: data });
  } catch (error) {
    next(error);
  }
};

export const AmenityUpdate: RequestHandler = async (req, res, next) => {
  try {
    await throwIfNotExist(Amenity, { _id: newObjectId(req.params.id), isDeleted: false }, ERROR.AMENITY.NOT_FOUND);
    let { name, thumbnail }: IAmenity = req.body;

    if (req.body.name) {
      await throwIfExist(
        Amenity,
        {
          _id: { $ne: newObjectId(req.params.id) },
          name: newRegExp(req.body.name),
          isDeleted: false,
        },
        ERROR.AMENITY.EXIST,
      );
    }

    let DestinationObjToUpdate = {
      ...req.body,
    };

    if (thumbnail && thumbnail.includes("base64")) {
      req.body["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }
    const data: IAmenity | any = await findByIdAndUpdate<IAmenity>(Amenity, newObjectId(req.params.id), req.body);

    res.status(200).json({ message: MESSAGE.AMENITY.UPDATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const AmenityDelete: RequestHandler = async (req, res, next) => {
  try {
    const expense: any = await throwIfNotExist<IAmenity>(
      Amenity,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.AMENITY.NOT_FOUND,
    );

    // await throwIfExist<IUser>(User, { expenseId: expense?._id, isDeleted: false }, ERROR.AMENITY.CANT_DELETE);

    const dataToSoftDelete = {
      isDeleted: true,
    };

    await findByIdAndUpdate(Amenity, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.AMENITY.REMOVED });
  } catch (error) {
    next(error);
  }
};
