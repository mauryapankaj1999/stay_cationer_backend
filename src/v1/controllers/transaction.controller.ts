import { ROLES } from "common/constant.common";
import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Property } from "models/property.model";
import { Transaction, ITransaction } from "models/transaction.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "TRANSACTION BODY");
  try {
    const { title,amount,description ,propertyId} = req.body;

    const requiredFields: any = {
      Title: title,
      Amount: amount,
      Description: description,
      Property:propertyId
    };

    verifyRequiredFields(requiredFields);

    let propertyObj:any = await Property.findById(newObjectId(propertyId));

     if (!propertyObj) {
       throw new Error("Property Not Found");
    }
    req.body.sellerId = propertyObj?.sellerId;
    const newTransactionObj = {
      ...req.body,
    };

    const newTransaction: any = await createDocuments<ITransaction>(Transaction, newTransactionObj);

    res.status(200).json({ message: MESSAGE.TRANSACTION.CREATED, data: newTransaction._id });
  } catch (error) {
    console.log("ERROR IN TRANSACTION CONTROLLER");
    next(error);
  }
};

export const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false };

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }


    if (req.query.propertyId) {
      matchObj.propertyId = newObjectId(req.query.propertyId);
    }
     if (req.query.paymentType) {
       matchObj.paymentType = req.query.paymentType;
     }

    if (req.user) {
      let user = req.user
      let role = user.role
      if (role == ROLES.SELLER) {
        matchObj.sellerId = newObjectId(user.userId);
      }
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

      

    const eTransactionArr = await paginateAggregate(Transaction, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.TRANSACTION.ALLTRANSACTION, data: eTransactionArr.data, total: eTransactionArr.total });
  } catch (error) {
    console.log("ERROR IN TRANSACTION CONTROLLER");
    next(error);
  }
};

export const getTransactionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eTransaction = await throwIfNotExist(
      Transaction,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.TRANSACTION.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.TRANSACTION.GOTBYID, data: eTransaction });
  } catch (error) {
    console.log("ERROR IN TRANSACTION CONTROLLER");
    next(error);
  }
};

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { title }: ITransaction = req.body;

    let eTransaction: any = await throwIfNotExist(
      Transaction,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.TRANSACTION.NOT_FOUND,
    );

    if (title) {
      await throwIfExist(
        Transaction,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          title: newRegExp(title),
        },
        ERROR.TRANSACTION.EXIST,
      );
    }

    let eTransactionObjToUpdate = {
      ...req.body,
    };

    const updatedxpenseCategory = await findByIdAndUpdate<ITransaction>(
      Transaction,
      newObjectId(req.params.id),
      eTransactionObjToUpdate,
      {
        new: true,
      },
    );

    res.status(200).json({ message: MESSAGE.TRANSACTION.UPDATED, data: updatedxpenseCategory });
  } catch (error) {
    console.log("ERROR IN TRANSACTION CONTROLLER");
    next(error);
  }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expenseCategory: ITransaction | any = await throwIfNotExist(
      Transaction,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.TRANSACTION.NOT_FOUND,
    );

    const dataToSoftDelete = {
      isDeleted: true,
    };

    await findByIdAndUpdate(Transaction, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.TRANSACTION.REMOVED });
  } catch (error) {
    console.log("ERROR IN TRANSACTION CONTROLLER");
    next(error);
  }
};
