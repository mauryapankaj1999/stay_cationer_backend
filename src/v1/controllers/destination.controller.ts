import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { getProductUinqueSlug } from "helpers/slug";
import { Destination, IDestination } from "models/destination.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const creatDestination = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, thumbnail } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IDestination>(
      Destination,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.DESTINATION.EXIST,
    );

    const newDestinationObj = {
      ...req.body,
      slug: await getProductUinqueSlug(name),
    };

    if (thumbnail && typeof thumbnail === "string") {
      newDestinationObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const newDestination: any = await createDocuments<IDestination>(Destination, newDestinationObj);

    res.status(200).json({ message: MESSAGE.DESTINATION.CREATED, data: newDestination._id });
  } catch (error) {
    console.log("ERROR IN DESTINATION CONTROLLER");
    next(error);
  }
};

export const getDestination = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    if (req.query.q && req.query.q !== "") {
      matchObj.name = new RegExp(`${req.query.q}`, `i`);
    }
    if (req.query.isTop != undefined) {
      matchObj.isTop = Boolean(req.query.isTop);
    }
    if (req.query.status) {
      matchObj.status = req.query.status;
    }

    let pipeline: PipelineStage[] = [
      {
        $match: matchObj,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];
    if (req.query.isForSelectInput) {
      pipeline.push({
        $project: {
          label: "$name",
          value: "$_id",
        },
      });
    }

    let DestinationArr = await paginateAggregate(Destination, pipeline, req.query);

    if (!Array.isArray(DestinationArr.data) || DestinationArr.data.length === 0) {
      pipeline = [
        {
          $sort: {
            createdAt: -1,
          },
        },
      ];
      if (req.query.isForSelectInput) {
        pipeline.push({
          $project: {
            label: "$name",
            value: "$_id",
          },
        });
      }

      DestinationArr = await paginateAggregate(Destination, pipeline, req.query);
    }

    res
      .status(200)
      .json({ message: MESSAGE.DESTINATION.ALLDESTINATION, data: DestinationArr.data, total: DestinationArr.total });
  } catch (error) {
    console.log("ERROR IN DESTINATION CONTROLLER");
    next(error);
  }
};

export const getDestinationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const DestinationObj = await throwIfNotExist(
      Destination,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.DESTINATION.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.DESTINATION.GOTBYID, data: DestinationObj });
  } catch (error) {
    console.log("ERROR IN DESTINATION CONTROLLER");
    next(error);
  }
};

export const updatDestination = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name, thumbnail }: IDestination = req.body;

    let DestinationObj: any = await throwIfNotExist(
      Destination,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.DESTINATION.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        Destination,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.DESTINATION.EXIST,
      );
    }

    let DestinationObjToUpdate = {
      ...req.body,
      slug: await getProductUinqueSlug(name),
    };

    if (thumbnail && thumbnail.includes("base64")) {
      DestinationObjToUpdate["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const updatedDestination = await findByIdAndUpdate<IDestination>(
      Destination,
      newObjectId(req.params.id),
      DestinationObjToUpdate,
      {
        new: true,
      },
    );

    res.status(200).json({ message: MESSAGE.DESTINATION.UPDATED, data: updatedDestination });
  } catch (error) {
    console.log("ERROR IN DESTINATION CONTROLLER");
    next(error);
  }
};

export const deletDestination = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const DestinationObj: IDestination | any = await throwIfNotExist(
      Destination,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.DESTINATION.NOT_FOUND,
    );
    const dataToSoftDelete = {
      isDeleted: true,
    };

    await findByIdAndUpdate(Destination, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.DESTINATION.REMOVED });
  } catch (error) {
    console.log("ERROR IN DESTINATION CONTROLLER");
    next(error);
  }
};
