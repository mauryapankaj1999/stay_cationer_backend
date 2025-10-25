import { Subscribe } from "models/subscribe.model"; // Import your model here
import { NextFunction, Request, Response } from "express";
import { paginateAggregate } from "utils/paginateAggregate";
import mongoose, { PipelineStage } from "mongoose";
import { notification } from "models/notification.model";

export const Subscribeadd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await Subscribe.findOne({ name: req.body.Email }).exec();
    if (existsCheck) {
      throw new Error(" already exists");
    }

    const subscribeData = new Subscribe(req.body);
    await subscribeData.save();
    const notificationObj = {
      link: `/Subcribers?subscribeId=${subscribeData._id}`,
      userName: subscribeData?.Email,
      id: subscribeData._id,
      text: `Subscribed  by ${subscribeData?.Email}`,
      seen: false,
      createdAt: new Date(),
    };
    const notifiy = new notification(notificationObj);
    await notifiy.save();
    res.status(201).json({ message: " Created" });
  } catch (error) {
    next(error);
  }
};

export const SubscribegetAll = async (req: any, res: any, next: any) => {
  try {
    let pipeline: PipelineStage[] = [];
    let matchObj: Record<string, any> = {};
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
    let Arr = await paginateAggregate(Subscribe, pipeline, req.query);
    res.status(201).json({ message: "found all ", data: Arr.data, total: Arr.total });
  } catch (error) {
    next(error);
  }
};

export const SubscribegetById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let pipeline: PipelineStage[] = [];
    let matchObj: Record<string, any> = {};
    if (req.params.id) {
      matchObj._id = new mongoose.Types.ObjectId(req.params.id);
    }
    pipeline.push({
      $match: matchObj,
    });
    let existsCheck = await Subscribe.aggregate(pipeline);
    if (!existsCheck || existsCheck.length == 0) {
      throw new Error(" does not exists");
    }
    existsCheck = existsCheck[0];
    res.status(201).json({
      message: "found specific ",
      data: existsCheck,
    });
  } catch (error) {
    next(error);
  }
};

export const SubscribeupdateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await Subscribe.findById(req.params.id).lean().exec();
    if (!existsCheck) {
      throw new Error(" does not exists");
    }
    let Obj = await Subscribe.findByIdAndUpdate(req.params.id, req.body).exec();
    res.status(201).json({ message: " Updated" });
  } catch (error) {
    next(error);
  }
};

export const SubscribedeleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await Subscribe.findById(req.params.id).exec();
    if (!existsCheck) {
      throw new Error(" does not exists or already deleted");
    }
    await Subscribe.findByIdAndDelete(req.params.id).exec();
    res.status(201).json({ message: " Deleted" });
  } catch (error) {
    next(error);
  }
};
