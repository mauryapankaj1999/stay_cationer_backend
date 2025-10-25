/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateGift } from "models/createGift.model";
import { NextFunction, Request, Response } from "express";
import { paginateAggregate } from "utils/paginateAggregate";
import mongoose, { PipelineStage } from "mongoose";
import { notification } from "models/notification.model";

export const addData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const giftCreated = await new CreateGift(req.body).save();
    const notificationObj = {
      link: `/send-gift/list?GiftId=${giftCreated._id}`,
      userName: giftCreated?.sender.name,
      id: giftCreated._id,
      text: `gift created by ${giftCreated?.sender.name}`,
      seen: false,
      createdAt: new Date(),
    };
    const notifiy = new notification(notificationObj);
    await notifiy.save();

    res.status(201).json({ message: "CreateGift Created" });
  } catch (error) {
    next(error);
  }
};

export const getAllData = async (req: any, res: any, next: any) => {
  try {
    const pipeline: PipelineStage[] = [];
    const matchObj: Record<string, any> = {};
    if (req.query.query && req.query.query != "") {
      matchObj.name = new RegExp(req.query.query, "i");
    }
    pipeline.push(
      {
        $match: matchObj,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    );
    const CreateGiftArr = await paginateAggregate(CreateGift, pipeline, req.query);
    res.status(201).json({ message: "found all CreateGift", data: CreateGiftArr.data, total: CreateGiftArr.total });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pipeline: PipelineStage[] = [];
    const matchObj: Record<string, any> = {};
    if (req.params.id) {
      matchObj._id = new mongoose.Types.ObjectId(req.params.id);
    }
    pipeline.push({
      $match: matchObj,
    });
    let existsCheck = await CreateGift.aggregate(pipeline);
    if (!existsCheck || existsCheck.length == 0) {
      throw new Error("CreateGift does not exists");
    }
    existsCheck = existsCheck[0];
    res.status(201).json({
      message: "found specific CreateGift",
      data: existsCheck,
    });
  } catch (error) {
    next(error);
  }
};

export const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await CreateGift.findById(req.params.id).lean().exec();
    if (!existsCheck) {
      throw new Error("CreateGift does not exists");
    }
    res.status(201).json({ message: "CreateGift Updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await CreateGift.findById(req.params.id).exec();
    if (!existsCheck) {
      throw new Error("CreateGift does not exists or already deleted");
    }
    await CreateGift.findByIdAndDelete(req.params.id).exec();
    res.status(201).json({ message: "CreateGift Deleted" });
  } catch (error) {
    next(error);
  }
};
