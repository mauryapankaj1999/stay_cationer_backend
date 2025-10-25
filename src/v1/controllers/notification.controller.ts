import { notification } from "models/notification.model";
import { NextFunction, Request, Response } from "express";
import { paginateAggregate } from "utils/paginateAggregate";
import mongoose, { PipelineStage } from "mongoose";

export const addnotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await notification.findOne({ name: req.body.name }).exec();
    if (existsCheck) {
      throw new Error("notification already exists");
    }
    await new notification(req.body).save();
    res.status(201).json({ message: "notification Created" });
  } catch (error) {
    next(error);
  }
};

export const getAllnotification = async (req: any, res: any, next: any) => {
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
    let notificationArr = await paginateAggregate(notification, pipeline, req.query);
    res
      .status(201)
      .json({ message: "found all notification", data: notificationArr.data, total: notificationArr.total });
  } catch (error) {
    next(error);
  }
};

export const getnotificationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let pipeline: PipelineStage[] = [];
    let matchObj: Record<string, any> = {};
    if (req.params.id) {
      matchObj._id = new mongoose.Types.ObjectId(req.params.id);
    }
    pipeline.push({
      $match: matchObj,
    });
    let existsCheck = await notification.aggregate(pipeline);
    if (!existsCheck || existsCheck.length == 0) {
      throw new Error("notification does not exists");
    }
    existsCheck = existsCheck[0];
    res.status(201).json({
      message: "found specific notification",
      data: existsCheck,
    });
  } catch (error) {
    next(error);
  }
};

export const updatenotificationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await notification.findById(req.params.id).lean().exec();
    if (!existsCheck) {
      throw new Error("notification does not exists");
    }
    let Obj = await notification.findByIdAndUpdate(req.params.id, req.body).exec();
    res.status(201).json({ message: "notification Updated" });
  } catch (error) {
    next(error);
  }
};

export const deletenotificationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("req.params.id", req.params.id);
    let existsCheck = await notification.findOneAndDelete({ id: new mongoose.Types.ObjectId(req.params.id) }).exec();
    if (!existsCheck) {
      throw new Error("notification does not exists or already deleted");
    }
    await notification.findByIdAndDelete(req.params.id).exec();
    res.status(201).json({ message: "notification Deleted" });
  } catch (error) {
    next(error);
  }
};

export const deleteAllNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notification.deleteMany({}).exec();
    res.status(201).json({ message: "All notifications Deleted" });
  } catch (error) {
    next(error);
  }
};
