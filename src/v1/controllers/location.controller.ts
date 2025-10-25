
import { Request, Response, NextFunction } from "express";
import { City } from "models/city.model";
import { State } from "models/state.model";
import mongoose from "mongoose";

export const getAllStates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let queryObj: any = {};

    if (req.query.searchQuery) {
      queryObj = {
        ...queryObj,
        $or: [],
      };

      queryObj.$or.push({ name: new RegExp(`${req.query.searchQuery}`, "i") });
    } else {
      // let statesString = await getDataFromRedis("statesList");
      // if (statesString) {
      //   let users = JSON.parse(statesString);
      //   res.json({ message: "ALL Users", data: users });
      // }
    }


    let pipeline: any = [
      {
        $match: queryObj,
      },
      {
        $sort:{name:1}
      }
    ];

    if (req.query.isForSelectInput) {
      pipeline.push({
        $project: {
          label: "$name",
          value: "$_id",
        },
      });
    }
    const users = await State.aggregate(pipeline);
    // await updateObjInRedis("statesList", JSON.stringify(users));

    res.json({ message: "ALL Users", data: users });
  } catch (error) {
    next(error);
  }
};

export const getAllCities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let queryObj: any = {};

    if (req.query.searchQuery) {
      queryObj = {
        ...queryObj,
        $or: [],
      };

      queryObj.$or.push({ name: new RegExp(`${req.query.searchQuery}`, "i") });
    }

    let pipeline: any = [
      {
        $match: queryObj,
      },
      {
        $sort: { name: 1 },
      },
    ];

    if (req.query.isForSelectInput) {
      pipeline.push({
        $project: {
          label: "$name",
          value: "$_id",
          stateId: "$stateId",
        },
      });
    }
    const users = await City.aggregate(pipeline);
    res.json({ message: "ALL Users", data: users });
  } catch (error) {
    next(error);
  }
};
