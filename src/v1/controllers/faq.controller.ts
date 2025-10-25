import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { RequestHandler } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Faq, IFaq } from "models/faq.model";
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

export const FaqAdd: RequestHandler = async (req, res, next) => {
  try {
    const { name, thumbnail } = req.body;

    const requiredFields = { Name: name };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IFaq>(
      Faq,
      {
        name: newRegExp(name),
        isDeleted: false,
      },
      ERROR.FAQ.EXIST,
    );

    
    const newFaqObj = {
      ...req.body,
    };

       if (thumbnail && typeof thumbnail === "string") {
         newFaqObj["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
       }

    const data: any = await createDocuments(Faq, newFaqObj);

    res.status(201).json({ message: MESSAGE.FAQ.CREATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const FaqGet: RequestHandler = async (req, res, next) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

     if (req.query.faqCategoryId) {
       matchObj.faqCategoryId = newObjectId(req.query.faqCategoryId);
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

    const data = await paginateAggregate(Faq, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.FAQ.ALLFAQ, data: data.data, total: data.total });
  } catch (error) {
    next(error);
  }
};

export const FaqGetById: RequestHandler = async (req, res, next) => {
  try {
    const data = await throwIfNotExist(
      Faq,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.FAQ.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.FAQ.GOTBYID, data: data });
  } catch (error) {
    next(error);
  }
};

export const FaqUpdate: RequestHandler = async (req, res, next) => {
  try {
    await throwIfNotExist(Faq, { _id: newObjectId(req.params.id), isDeleted: false }, ERROR.FAQ.NOT_FOUND);
    let { name, thumbnail }: IFaq = req.body;

    if (req.body.name) {
      await throwIfExist(
        Faq,
        {
          _id: { $ne: newObjectId(req.params.id) },
          name: newRegExp(req.body.name),
          isDeleted: false,
        },
        ERROR.FAQ.EXIST,
      );
    }

     let DestinationObjToUpdate = {
       ...req.body,
     };

    if (thumbnail && thumbnail.includes("base64")) {
      req.body["thumbnail"] = await storeFileAndReturnNameBase64(thumbnail);
    }
    const data: IFaq | any = await findByIdAndUpdate<IFaq>(Faq, newObjectId(req.params.id), req.body);

    res.status(200).json({ message: MESSAGE.FAQ.UPDATED, data: data._id });
  } catch (error) {
    next(error);
  }
};

export const FaqDelete: RequestHandler = async (req, res, next) => {
  try {
    const expense: any = await throwIfNotExist<IFaq>(
      Faq,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.FAQ.NOT_FOUND,
    );

    // await throwIfExist<IUser>(User, { expenseId: expense?._id, isDeleted: false }, ERROR.FAQ.CANT_DELETE);

    const dataToSoftDelete = {
      isDeleted: true,
    };

    await findByIdAndUpdate(Faq, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.FAQ.REMOVED });
  } catch (error) {
    next(error);
  }
};
