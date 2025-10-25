import { HomeLogs } from "models/homeLogs.model";
import { NextFunction, Request, Response } from "express";
import { paginateAggregate } from "utils/paginateAggregate";
import mongoose, { PipelineStage } from "mongoose";

export const addHomeLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await HomeLogs.findOne({ name: req.body.name }).exec();
    // if (existsCheck) {
    //   throw new Error("HomeLog already exists");
    // }
    await new HomeLogs(req.body).save();
    res.status(201).json({ message: "HomeLog Created" });
  } catch (error) {
    next(error);
  }
};

export const getAllHomeLogs = async (req: any, res: any, next: any) => {
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
    let HomeLogsArr = await paginateAggregate(HomeLogs, pipeline, req.query);
    res.status(201).json({ message: "found all HomeLog", data: HomeLogsArr.data, total: HomeLogsArr.total });
  } catch (error) {
    next(error);
  }
};

export const getHomeLogsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let pipeline: PipelineStage[] = [];
    let matchObj: Record<string, any> = {};
    if (req.params.id) {
      matchObj._id = new mongoose.Types.ObjectId(req.params.id);
    }
    pipeline.push({
      $match: matchObj,
    });
    let existsCheck = await HomeLogs.aggregate(pipeline);
    if (!existsCheck || existsCheck.length == 0) {
      throw new Error("HomeLog does not exists");
    }
    existsCheck = existsCheck[0];
    res.status(201).json({
      message: "found specific HomeLog",
      data: existsCheck,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHomeLogsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await HomeLogs.findById(req.params.id).lean().exec();
    if (!existsCheck) {
      throw new Error("HomeLog does not exists");
    }
    let Obj = await HomeLogs.findByIdAndUpdate(req.params.id, req.body).exec();
    res.status(201).json({ message: "HomeLog Updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteHomeLogsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await HomeLogs.findById(req.params.id).exec();
    if (!existsCheck) {
      throw new Error("HomeLog does not exists or already deleted");
    }
    await HomeLogs.findByIdAndDelete(req.params.id).exec();
    res.status(201).json({ message: "HomeLog Deleted" });
  } catch (error) {
    next(error);
  }
};
