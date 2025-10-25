import { ERROR } from "common/error.common";
import { MESSAGE } from "common/messages.common";
import { Request, Response, NextFunction } from "express";
import { storeFileAndReturnNameBase64 } from "helpers/fileSystem";
import { Property } from "models/property.model";
import { Rate, IRate } from "models/rate.model";
import mongoose, { PipelineStage } from "mongoose";
import { verifyRequiredFields } from "utils/error";
import { createDocuments, findByIdAndUpdate, newObjectId, throwIfExist, throwIfNotExist } from "utils/mongoQueries";
import { paginateAggregate } from "utils/paginateAggregate";
import { newRegExp } from "utils/regex";
import moment from "moment";
import { setDayEndTime, setDayStartTime } from "helpers/date";
import { Destination } from "models/destination.model";
import { ROLES } from "common/constant.common";
import { Coupon } from "models/coupon.model";
import { Order } from "models/order.model";

export const creatRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { hotelId, price, isAvailable } = req.body;

    const requiredFields: any = {
      Hotel: hotelId,
    };

    verifyRequiredFields(requiredFields);

    let propertyObj = await Property.findById(newObjectId(hotelId));

    if (!propertyObj) {
      throw new Error("Property not exists");
    }

    let role = ROLES.ADMIN;

    if (req.user) {
      let user = req.user;
      role = user.role;
    }

    let rateArr = [];

    for (const date of req.body?.dateArr) {
      let ratePriceObj = await Rate.findOne({
        propertyId: newObjectId(hotelId),
        date: { $gte: setDayStartTime(new Date(date)), $lt: setDayEndTime(new Date(date)) },
      });

      console.log(ratePriceObj, "||");

      console.log("🚀 -------------------------------------------🚀")
      console.log("🚀 ~ creatRate ~ ratePriceObj:", ratePriceObj)
      console.log("🚀 -------------------------------------------🚀")
      if (ratePriceObj) {
        let updateObj: any = {
          isAvailable,
        };

        if (role == ROLES.ADMIN || role == ROLES.SELLER) {
          updateObj.price = req.body.price;
        }

        console.log("RATE UPDATE OBJ", updateObj, "@@");

        await findByIdAndUpdate<IRate>(
          Rate,
          newObjectId(ratePriceObj?._id),
          {
            $set: updateObj,
          },
          {
            new: true,
          },
        );
      } else {
        let rateObj: any = {
          propertyId: hotelId,
          name: propertyObj?.name,
          date,
          isAvailable: isAvailable,
        };

        let updateObj: any = {
          isAvailable,
        };

        if (role == ROLES.ADMIN || role == ROLES.SELLER) {
          console.log("🚀 -----------------------------------🚀")
          console.log("🚀 ~ creatRate ~ req.user:", price);
          console.log("🚀 -----------------------------------🚀")
          rateObj.price = req.body.price;
          console.log("🚀 -----------------------------------------------🚀")
          console.log("🚀 ~ creatRate ~ ", req.body.price)
          console.log("🚀 -----------------------------------------------🚀")
        }
        console.log(role, "RATE CREATE HERE CHECK");
        const newRate: any = await createDocuments<IRate>(Rate, rateObj);
      }
    }

    res.status(200).json({ message: MESSAGE.RATE.CREATED });
  } catch (error) {
    console.log("ERROR IN RATE CONTROLLER");
    next(error);
  }
};

export const getRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = {};

    let startDate: any = moment().startOf("day").format("YYYY-MM-DD");
    let endDate: any = moment(startDate).endOf("day").format("YYYY-MM-DD");
    if (req.query?.startDate && req.query?.endDate) {
      startDate = req.query?.startDate;
      endDate = req.query?.endDate;
    }

    const date1 = moment(new Date(startDate));
    const date2 = moment(new Date(endDate));
    const days = Math.abs(date1.diff(date2, "days"));
    req.query.pageSize = String(days);

    if (req.query.hotelId) {
      matchObj.propertyId = newObjectId(req.query.hotelId);
    }

    if (date1) {
      matchObj.date = {
        $gte: new Date(startDate),
      };
    }
    if (date2) {
      matchObj.date = {
        ...matchObj.date,
        $lt: new Date(endDate),
      };
    }

    let pipeline: PipelineStage[] = [
      {
        $sort: {
          date: 1,
        },
      },
      {
        $match: matchObj,
      },
    ];

    const RateArr = await paginateAggregate(Rate, pipeline, req.query);

    res.status(200).json({ message: MESSAGE.RATE.ALLRATE, data: RateArr.data, total: RateArr.total });
  } catch (error) {
    console.log("ERROR IN RATE CONTROLLER");
    next(error);
  }
};

export const getRateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const RateObj = await throwIfNotExist(
      Rate,
      { _id: newObjectId(req.params.id), isDeleted: false },
      ERROR.RATE.NOT_FOUND,
    );

    res.status(200).json({ message: MESSAGE.RATE.GOTBYID, data: RateObj });
  } catch (error) {
    console.log("ERROR IN RATE CONTROLLER");
    next(error);
  }
};

export const updatRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { name }: IRate = req.body;

    let RateObj: any = await throwIfNotExist(
      Rate,
      {
        _id: newObjectId(req.params.id),
        isDeleted: false,
      },
      ERROR.RATE.NOT_FOUND,
    );

    if (name) {
      await throwIfExist(
        Rate,
        {
          _id: { $ne: newObjectId(req.params.id) },
          isDeleted: false,
          name: newRegExp(name),
        },
        ERROR.RATE.EXIST,
      );
    }

    let RateObjToUpdate = {
      ...req.body,
    };

    const updatedRate = await findByIdAndUpdate<IRate>(Rate, newObjectId(req.params.id), RateObjToUpdate, {
      new: true,
    });

    res.status(200).json({ message: MESSAGE.RATE.UPDATED, data: updatedRate });
  } catch (error) {
    console.log("ERROR IN RATE CONTROLLER");
    next(error);
  }
};

export const roomAvailablity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = {};

    let startDate, endDate;
    let propertyId = newObjectId(req.params.id);
    let propertyObj: any = await Property.findById(propertyId);

    if (!propertyObj) {
      throw new Error("Property Not Found");
    }
    const orders = await Order.find({ orderStatus: "CONFIRMED", propertyId: propertyId });

    orders.forEach(({ startDate, endDate }) => {
      const orderStart = moment(startDate);
      const orderEnd = moment(endDate);
      const date1 = new Date(req.body.startDate);
      date1.setHours(date1.getHours() + 5); // Ensure startDate is at the beginning of the day
      date1.setMinutes(date1.getMinutes() + 30); // Ensure startDate is at the beginning of the day
      // date1.setHours(0, 0, 0, 0);
      const date2 = new Date(req.body.endDate);
      date2.setHours(date2.getHours() + 5); // Ensure startDate is at the beginning of the day
      date2.setMinutes(date2.getMinutes() + 30); // Ensure startDate is at the beginning of the day
      // date2.setHours(0, 0, 0, 0);

      // Check if the date ranges overlap
      if (moment(date1).isBefore(orderEnd) && moment(date2).isAfter(orderStart)) {
        throw new Error("Dates are not available.");
      }
      if (moment(date1).isSame(orderStart) || moment(date2).isSame(orderEnd)) {
        throw new Error("Dates are not available.");
      }
    });

    if (req.body?.startDate && req.body?.endDate) {
      startDate = req.body?.startDate;
      endDate = req.body?.endDate;
    }
    // console.log(startDate, endDate, "||");
    // Set startDate to the very start of the day (00:00:00.000) and endDate to the very end of the day (23:59:59.999)
    const date1 = new Date(req.body.startDate);
    date1.setHours(date1.getHours() + 5); // Ensure startDate is at the beginning of the day
    date1.setMinutes(date1.getMinutes() + 30); // Ensure startDate is at the beginning of the day
    // date1.setHours(0, 0, 0, 0);
    const date2 = new Date(req.body.endDate);
    date2.setHours(date2.getHours() + 5); // Ensure startDate is at the beginning of the day
    date2.setMinutes(date2.getMinutes() + 30); // Ensure startDate is at the beginning of the day
    // date2.setHours(0, 0, 0, 0);

    console.log("Date1:", date1, "Date2:||", date2);
    if (req.body.propertyId) {
      matchObj.propertyId = newObjectId(req.body.propertyId);
    }

    if (date1) {
      matchObj.date = {
        $gte: new Date(date1),
      };
    }
    if (date2) {
      matchObj.date = {
        ...matchObj.date,
        $lt: new Date(date2),
      };
    }

    let pipeline: PipelineStage[] = [
      {
        $sort: {
          date: 1,
        },
      },
      {
        $match: matchObj,
      },
    ];

    let RateArr = await Rate.aggregate(pipeline);

    pipeline = [
      {
        $match: {
          expiryDate: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Only date part, ignores time
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          value: 1,
        },
      },
    ];
    const offers = await Coupon.aggregate(pipeline);
    // Attach offers as a separate field, not as an array element
    // Example: { data: RateArr, offers }
    // Do not merge offers into RateArr array
    // Just keep RateArr as is, and use offers in the response below
    console.log("Rate Array:", JSON.stringify(RateArr, null, 2));
    let locationObj = await Destination.findById(newObjectId(propertyObj.destinationId));
    if (locationObj && locationObj?._id) {
      propertyObj.location = locationObj?.name;
      propertyObj.destination = locationObj;
    }
    console.log(JSON.stringify(pipeline, null, 2), "PROPERTY OBJ");
    // Handle missing dates with basePrice
    // Create an array of all dates in the selected range
    const generateDateRange = (start: Date, end: Date) => {
      const dates = [];
      const current = new Date(start);

      while (current < end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };
    // Ensure date1 and date2 are valid Date objects
    // Only process if we have valid dates
    if (date1 && date2) {
      // Calculate all dates in the selected range
      const selectedDates = generateDateRange(date1, date2);
      // Extract dates that have rates defined
      const datesWithRates = RateArr.map((rate) => {
        const rateDate = moment(rate.date).format("YYYY-MM-DD");
        return moment(rateDate).format("YYYY-MM-DD");
      });

      // Check if any of the datesWithRates have isAvailable === false
      console.log("Dates With Rates:", RateArr);
      if (RateArr.length > 0) {
        const unavailableDates = RateArr.filter(
          (rate) => datesWithRates.includes(moment(rate.date).format("YYYY-MM-DD")) && rate.isAvailable === false,
        ).map((rate) => moment(rate.date).format("YYYY-MM-DD"));
        console.log("Unavailable Dates:", unavailableDates);
        if (unavailableDates.length > 0) {
          throw new Error("Dates are not available.");
        }
      }
      console.log(datesWithRates, "datesWithRates");

      console.log(selectedDates, "selectedDates");

      const datesWithoutRates = selectedDates
        .filter((date) => date < date2)
        .filter((date) => !datesWithRates.includes(moment(date).format("YYYY-MM-DD")));
      console.log("Dates Without Rates:", datesWithoutRates);
      // Calculate total from existing rates
      const totalExistingRates = RateArr.reduce((sum, rate) => sum + (rate.price || 0), 0);

      console.log("Total Existing Rates:", totalExistingRates, datesWithoutRates);

      // If there are dates without rates, handle them using basePrice
      if (datesWithoutRates.length > 0) {
        const basePrice = propertyObj.basePrice || 0;
        const additionalAmount = datesWithoutRates.length * basePrice;

        // Add information about missing dates
        const missingDatesInfo = {
          datesWithoutRates: datesWithoutRates,
          additionalAmount: additionalAmount,
          basePriceUsed: basePrice,
          totalAmount: totalExistingRates + additionalAmount,
        };
        console.log(missingDatesInfo, "missingDatesInfo");
        // Add the generated rates for missing dates
        const generatedRates = datesWithoutRates.map((date) => {
          return {
            date: new Date(date),
            price: basePrice,
            propertyId: propertyId,
            isAvailable: true,
            generated: true, // Flag to indicate this rate was generated
          };
        });
        console.log(generatedRates, "generatedRates");
        // Return the enhanced response
        return res.status(200).json({
          message: MESSAGE.RATE.ALLRATE,
          data: [...RateArr, ...generatedRates],
          offers,
          hotel: propertyObj,
          missingDatesInfo: missingDatesInfo,
        });
      }
    }

    // Original response if no missing dates handling was needed
    res.status(200).json({ message: MESSAGE.RATE.ALLRATE, data: RateArr, hotel: propertyObj });
  } catch (error) {
    console.log("ERROR IN RATE CONTROLLER");
    next(error);
  }
};

export const deletRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const RateObj: IRate | any = await throwIfNotExist(
      Rate,
      { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false },
      ERROR.RATE.NOT_FOUND,
    );
    const dataToSoftDelete = {
      isDeleted: true,
    };

    await findByIdAndUpdate(Rate, newObjectId(req.params.id), dataToSoftDelete);

    res.status(200).json({ message: MESSAGE.RATE.REMOVED });
  } catch (error) {
    console.log("ERROR IN RATE CONTROLLER");
    next(error);
  }
};
