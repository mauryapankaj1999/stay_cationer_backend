import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { FaqCategory, IFaqCategory } from "models/faqCategory.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const createFaqCategory = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "FAQCATEGORY BODY");
  try {
    const { name } = req.body;

    const requiredFields: any = {
      Name: name,
    };

    verifyRequiredFields(requiredFields);

    await throwIfExist<IFaqCategory>(
      FaqCategory,
      {
        name: newRegExp(req.body.name),
        isDeleted: false,
      },
      ERROR.FAQCATEGORY.EXIST,
    );

    const newFaqCategoryObj = {
      ...req.body,
    };

    const newFaqCategory: any = await createDocuments<IFaqCategory>(FaqCategory, newFaqCategoryObj);

    res.status(200).json({ message: MESSAGE.FAQCATEGORY.CREATED, data: newFaqCategory._id });
  } catch (error) {
    console.log("ERROR IN FAQCATEGORY CONTROLLER");
    next(error);
  }
};

export const getFaqCategory = async (req: Request, res: Response, next: NextFunction) => {
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

      if (req.query.faq === "true") {
      pipeline.push(
        {
          $lookup: {
            from: "faqs",
            localField: "_id",
            foreignField: "faqCategoryId",
            as: "faqs",
            pipeline: [
              {
                $unset: [
                  "faqCategoryName",
                  "isDeleted",
                  "thumbnail",
                  "status",
                  "createdAt",
                  "updatedAt",
                  "faqCategoryId",
                ],
              },
            ],
          },
        },
      );
      }

    const eFaqCategoryArr = await paginateAggregate(FaqCategory, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.FAQCATEGORY.ALLFAQCATEGORY, data: eFaqCategoryArr.data, total: eFaqCategoryArr.total });
  } catch (error) {
    console.log("ERROR IN FAQCATEGORY CONTROLLER");
    next(error);
  }
};

export const getFaqCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eFaqCategory = await throwIfNotExist(
      FaqCategory,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.FAQCATEGORY.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.FAQCATEGORY.GOTBYID, data: eFaqCategory });
  } catch (error) {
    console.log("ERROR IN FAQCATEGORY CONTROLLER");
    next(error);
  }
};

export const updateFaqCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name }: IFaqCategory = req.body;

    let eFaqCategory: any = await throwIfNotExist(
      FaqCategory,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.FAQCATEGORY.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        FaqCategory,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.FAQCATEGORY.EXIST,
      );
    }

    let eFaqCategoryObjToUpdate = {
      ...req.body,
    };

    const updatedxpenseCategory = await findByIdAndUpdate<IFaqCategory>(
      FaqCategory,
      newObjectId(req.params.id),
      eFaqCategoryObjToUpdate,
      {
        new: true,
      },
    );

    res.status(200).json({ message: MESSAGE.FAQCATEGORY.UPDATED, data: updatedxpenseCategory });
  } catch (error) {
    console.log("ERROR IN FAQCATEGORY CONTROLLER");
    next(error);
  }
};

export const deleteFaqCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expenseCategory: IFaqCategory | any = await throwIfNotExist(
      FaqCategory,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.FAQCATEGORY.NOT_FOUND,
    );

    const dataToSoftDelete = {
      isDeleted: true,
    };

    await findByIdAndUpdate(FaqCategory, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.FAQCATEGORY.REMOVED });
  } catch (error) {
    console.log("ERROR IN FAQCATEGORY CONTROLLER");
    next(error);
  }
};
