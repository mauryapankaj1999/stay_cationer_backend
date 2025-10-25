import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
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
import { Order } from "models/order.model";
import { ROLES } from "common/constant.common";
import mongoose, { PipelineStage } from "mongoose";
import { Property } from "models/property.model";
import moment from "moment";

export const totalCounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let filter = req.query?.dateFilter ? req.query?.dateFilter : "TODAY";
    const { start, end } = getTimeFrame(filter);
    let matchObj: Record<string, any> = {};
    if (req.user) {
      let user = req.user;
      let role = user.role;
      if (role == ROLES.SELLER) {
        matchObj.sellerId = newObjectId(user.userId);
      }

      if (role == ROLES.USER) {
        matchObj.userId = newObjectId(user.userId);
      }
    }
    const result = await Order.aggregate([
      {
        $match: matchObj,
      },
      {
        $match: {
          $or: [
            { createdAt: { $gte: start, $lte: end } }, // Reservations
            { startDate: { $gte: start, $lte: end } }, // Arrivals
            { endDate: { $gte: start, $lte: end } }, // Departures
          ],
        },
      },
      {
        $addFields: {
          latestStatus: { $arrayElemAt: ["$orderStatusArr.orderStatus", -1] }, // Get the latest order status
          latestStatusUpdatedOn: { $arrayElemAt: ["$orderStatusArr.updatedOn", -1] }, // Get the latest update date as string
        },
      },
      {
        $addFields: {
          latestStatusUpdatedOnDate: { $toDate: "$latestStatusUpdatedOn" }, // Convert to Date
        },
      },
      {
        $group: {
          _id: null,
          reservations: {
            $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", start] }, { $lte: ["$createdAt", end] }] }, 1, 0] },
          },
          arrivals: {
            $sum: { $cond: [{ $and: [{ $gte: ["$startDate", start] }, { $lte: ["$startDate", end] }] }, 1, 0] },
          },
          departures: {
            $sum: { $cond: [{ $and: [{ $gte: ["$endDate", start] }, { $lte: ["$endDate", end] }] }, 1, 0] },
          },
          cancelled: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$latestStatusUpdatedOnDate", start] },
                    { $lte: ["$latestStatusUpdatedOnDate", end] },
                    { $eq: ["$latestStatus", "CANCELLED"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          reservations: "$reservations",
          arrivals: "$arrivals",
          departures: "$departures",
          cancelled: "$cancelled",
        },
      },
    ]);

    console.log(result);

    let resultData = result.length ? result[0] : { reservations: 0, arrivals: 0, departures: 0, cancelled: 0 };
    res.status(201).json({ message: MESSAGE.AMENITY.CREATED, data: resultData });
  } catch (error) {
    next(error);
  }
};

const getTimeFrame = (filter: any) => {
  const now = new Date();
  switch (filter) {
    case "TODAY":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "WEEK":
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case "MONTH":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "YEAR":
      return { start: startOfYear(now), end: endOfYear(now) };
    default:
      return { start: startOfDay(now), end: endOfDay(now) };
  }
};

export const getOrdersData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = {};

    let filter = req.query?.dateFilter ? req.query?.dateFilter : "TODAY";
    const { start, end } = getTimeFrame(filter);
    let filerObj = {
      $or: [
        { createdAt: { $gte: start, $lte: end } },
        { startDate: { $gte: start, $lte: end } },
        { endDate: { $gte: start, $lte: end } },
      ],
    };
    if (req.user) {
      let user = req.user;
      let role = user.role;
      if (role == ROLES.SELLER) {
        matchObj.sellerId = newObjectId(user.userId);
      }

      if (role == ROLES.USER) {
        matchObj.userId = newObjectId(user.userId);
      }
    }

    if (req.query.hotelId) {
      matchObj.propertyId = newObjectId(req.query.hotelId);
    }

    if (req.query.startDate) {
      matchObj.startDate = {
        $gte: new Date(`${req.query.startDate}`),
      };
    }
    if (req.query.endDate) {
      matchObj.endDate = {
        $lte: new Date(`${req.query.endDate}`),
      };
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
      {
        $match: filerObj,
      },
    ];

    const BannerArr = await paginateAggregate(Order, pipeline, req.query);

    res.status(200).json({ message: "All Booking", data: BannerArr.data, total: BannerArr.total });
  } catch (error) {
    console.log("ERROR IN BANNER CONTROLLER");
    next(error);
  }
};

export const DashboardMetrices: RequestHandler = async (req, res, next) => {
  try {
    let startDate = new Date();
    let endDate = new Date();
    let hotelIds = [];
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    startDate = new Date(moment(startDate).format("YYYY-MM-DD"));
    endDate = new Date(moment(endDate).format("YYYY-MM-DD"));

    const dashBoardDurationType = req.query.dateFilter;

    let reservationMatchObj: any = {};

    let pageIndex = Number(req.query.pageIndex) || 0;
    let pageSize = Number(req.query.pageSize) || 10;

    switch (dashBoardDurationType) {
      case "TODAY":
        // startDate and endDate already point to today with time set to 00:00:00
        break;

      case "WEEK":
        {
          const day = startDate.getDay(); // Sunday - Saturday : 0 - 6
          const diffToMonday = day === 0 ? -6 : 1 - day; // Adjust to get to Monday
          startDate.setDate(startDate.getDate() + diffToMonday);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
        }
        break;

      case "MONTH":
        startDate.setDate(1);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0); // last day of current month
        break;

      case "YEAR":
        startDate = new Date(startDate.getFullYear(), 0, 1);
        endDate = new Date(startDate.getFullYear(), 11, 31);
        break;

      default:
        console.warn("Unknown filterTab:", dashBoardDurationType);
        break;
    }

    // MongoDB Aggregation Pipeline with $facet
    // If hotelIds are available (for SELLER), filter by those propertyIds
    if (req.user.role === ROLES.SELLER) {
      const propertyIds = await Property.find({ sellerId: new mongoose.Types.ObjectId(req.user.userId) }).select("_id");
      hotelIds = propertyIds.map((p: any) => p._id);
    }

    // Add hotelIds filter to all relevant $match stages
    const propertyIdFilter =
      req.query.hotelId !== ""
        ? { propertyId: new mongoose.Types.ObjectId(String(req.query.hotelId)) }
        : hotelIds.length
          ? { propertyId: { $in: hotelIds } }
          : {};

    const dateMatchFilter = {
      $expr: {
        $and: [{ $lte: ["$startDate", endDate] }, { $gte: ["$endDate", startDate] }],
      },
    };

    const pipeline = [
      {
        $match: {
          $expr: {
            $and: [{ $lte: ["$startDate", endDate] }, { $gte: ["$endDate", startDate] }],
          },
          ...propertyIdFilter,
        },
      },
      {
        $facet: {
          revenue: [
            { $match: { ...dateMatchFilter, orderStatus: "CONFIRMED", ...propertyIdFilter } },
            {
              $group: {
                _id: null,
                total: { $sum: "$totalAmount" },
              },
            },
          ],
          totalNoOfReservations: [{ $match: { ...dateMatchFilter, ...propertyIdFilter } }, { $count: "total" }],
          totalNoOfArivals: [
            {
              $match: {
                ...dateMatchFilter,
                orderStatus: "CONFIRMED",
                ...propertyIdFilter,
              },
            },
            { $count: "total" },
          ],
          totalNoOfCancellations: [
            { $match: { ...dateMatchFilter, orderStatus: "CANCELLED", ...propertyIdFilter } },
            { $count: "total" },
          ],
          reservations: [
            { $match: { ...dateMatchFilter, ...propertyIdFilter } },
            { $skip: pageSize * pageIndex },
            { $limit: pageSize },
            {
              $lookup: {
                from: "propertys",
                localField: "propertyId",
                foreignField: "_id",
                as: "propertyObj",
              },
            },
            {
              $unwind: {
                path: "$propertyObj",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                name: 1,
                propertyName: "$propertyObj.name",
                propertyTitle: "$propertyObj.title",
                startDate: "$startDate",
                endDate: "$endDate",
                orderStatus: 1,
                createdAt: 1,
              },
            },
          ],
          reservationsChartData: [
            { $match: { ...dateMatchFilter, ...propertyIdFilter } },
            {
              $lookup: {
                from: "propertys",
                localField: "propertyId",
                foreignField: "_id",
                as: "propertyObj",
              },
            },
            {
              $unwind: {
                path: "$propertyObj",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                name: 1,
                propertyName: "$propertyObj.name",
                propertyTitle: "$propertyObj.title",
                startDate: "$startDate",
                endDate: "$endDate",
                orderStatus: 1,
                createdAt: 1,
              },
            },
          ],
          reservationstotal: [{ $match: { ...reservationMatchObj, ...propertyIdFilter } }, { $count: "total" }],
        },
      },
    ];
    const results = await Order.aggregate(pipeline);

    const response = {
      revenue: results[0].revenue[0]?.total || 0,
      totalNoOfReservations: results[0].totalNoOfReservations[0]?.total || 0,
      totalNoOfArivals: results[0].totalNoOfArivals[0]?.total || 0,
      totalNoOfCancellations: results[0].totalNoOfCancellations[0]?.total || 0,
      reservations: results[0].reservations || [],
      reservationsChartData: results[0].reservationsChartData || [],
      reservationstotal: results[0].reservationstotal[0]?.total || 0,
    };
    console.log(startDate, endDate);

    res.status(200).json({
      message: "Dashboard Data",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};
