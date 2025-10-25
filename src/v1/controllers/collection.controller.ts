import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { getProductUinqueSlug } from "helpers/slug";
import { Collection, ICollection } from "models/collection.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const creatCollection = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "COLLECTION BODY");
  try {
    const { name, thumbnail } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<ICollection>(
      Collection,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.COLLECTION.EXIST,
    );

    const newCollectionObj = {
      ...req.body,
      slug: await getProductUinqueSlug(name),
    };

    if (thumbnail && typeof thumbnail === "string") {
      newCollectionObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const newCollection: any = await createDocuments<ICollection>(Collection, newCollectionObj);

    res.status(200).json({ message: MESSAGE.COLLECTION.CREATED, data: newCollection._id });
  } catch (error) {
    console.log("ERROR IN COLLECTION CONTROLLER");
    next(error);
  }
};

export const getCollection = async (req: Request, res: Response, next: NextFunction) => {
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

    const CollectionArr = await paginateAggregate(Collection, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.COLLECTION.ALLCOLLECTION, data: CollectionArr.data, total: CollectionArr.total });
  } catch (error) {
    console.log("ERROR IN COLLECTION CONTROLLER");
    next(error);
  }
};

export const getCollectionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const CollectionObj = await throwIfNotExist(
      Collection,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.COLLECTION.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.COLLECTION.GOTBYID, data: CollectionObj });
  } catch (error) {
    console.log("ERROR IN COLLECTION CONTROLLER");
    next(error);
  }
};

export const updatCollection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name, thumbnail }: ICollection = req.body;

    let CollectionObj: any = await throwIfNotExist(
      Collection,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.COLLECTION.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        Collection,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.COLLECTION.EXIST,
      );
    }

    let CollectionObjToUpdate = {
      ...req.body,
      slug: await getProductUinqueSlug(name),
    };

    if (thumbnail && thumbnail.includes("base64")) {
      CollectionObjToUpdate["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }

    const updatedCollection = await findByIdAndUpdate<ICollection>(Collection, newObjectId(req.params.id), CollectionObjToUpdate, {
      new: true,
    });

    res.status(200).json({ message: MESSAGE.COLLECTION.UPDATED, data: updatedCollection });
  } catch (error) {
    console.log("ERROR IN COLLECTION CONTROLLER");
    next(error);
  }
};

export const deletCollection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const CollectionObj: ICollection | any = await throwIfNotExist(
      Collection,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.COLLECTION.NOT_FOUND,
    );
    const dataToSoftDelete = {
      isDeleted: true,
    };

    await findByIdAndUpdate(Collection, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.COLLECTION.REMOVED });
  } catch (error) {
    console.log("ERROR IN COLLECTION CONTROLLER");
    next(error);
  }
};
