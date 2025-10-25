import { PropertyEnuiry } from "models/Propertyenquiry.model";
import { NextFunction, Request, Response } from "express";
import { paginateAggregate } from "utils/paginateAggregate";
import mongoose, { PipelineStage } from "mongoose";
import { notification } from "models/notification.model";
import { SendBrevoMail } from "services/brevoMail.service";
import { Property } from "models/property.model";
import generateHTML from "helpers/generateHTML";

export const addPropertyEnuiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("req.body", req.body);
    const propertyData = new PropertyEnuiry(req.body);
    await propertyData.save();
    const notificationObj = {
      link: `/PropertyEnuiry?enquiryId=${propertyData._id}`,
      userName: req.body.name,
      id: req.body.propertyId,
      text: `New Enquiry by ${req.body.name}`,
      seen: false,
      createdAt: new Date(),
    };
    const notifiy = new notification(notificationObj);
    await notifiy.save();

    const propertyExists = await Property.findById(req.body.propertyId).exec();

    let title = "<title>property enquiry Form</title>";

    let content = `<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <!-- Header -->
            <tr>
              <td align="center" style="padding: 20px; background-color: #202a37; border-radius: 8px 8px 0 0;">
                <h1 style="font-size: 24px; color: #ffffff; margin: 0;">property enquiry Form</h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding: 30px;">
                <h1 style="font-size: 24px; color: #333333; margin: 0 0 20px;">New Enquiry Submitted</h1>
                <p style="font-size: 16px; color: #555555; line-height: 1.5; margin: 0 0 20px;">
                  A new enquiry has been submitted through the property page. Please review the details below and take appropriate action.
                </p>
                <h2 style="font-size: 20px; color: #333333; margin: 20px 0 10px;">Enquiry Details</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="10" border="0" style="background-color: #f9f9f9; border-radius: 4px;">
                  <tr>
                    <td style="font-size: 16px; color: #555555; font-weight: bold; width: 30%;">Full Name:</td>
                    <td style="font-size: 16px; color: #555555;">${req.body.name}</td>
                  </tr>
                  <tr>
                  <td style="font-size: 16px; color: #555555; font-weight: bold; width: 30%;">Email:</td>
                  <td style="font-size: 16px; color: #555555;">${req.body.email}</td>
                  </tr>
                  <tr>
                  <td style="font-size: 16px; color: #555555; font-weight: bold; width: 30%;">Phone:</td>
                  <td style="font-size: 16px; color: #555555;">${req.body.mobile}</td>
                  </tr>
                  <tr>
                  <td style="font-size: 16px; color: #555555; font-weight: bold; width: 30%;">message:</td>
                  <td style="font-size: 16px; color: #555555;">${req.body.message}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px; color: #555555; font-weight: bold; width: 30%;">property Name:</td>
                    <td style="font-size: 16px; color: #555555;">${propertyExists?.name}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>`;

    // let html = generateHTML(title, content);
    // console.log("html", html);
    // const sent = await SendBrevoMail(
    //   "property Enquiry Form",
    //   [{ email: process.env.ADMIN_EAMI ??"deepak.negi@ebslon.com", name: req.body.name }],
    //   html,
    // );
    // if (!sent) {
    //   throw new Error("Mail not sent");
    // }
    res.status(201).json({ message: "PropertyEnuiry Created" });
  } catch (error) {
    next(error);
  }
};

export const getAllPropertyEnuiry = async (req: any, res: any, next: any) => {
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
        $addFields: {
          property: "$propertyObj.name",
        },
      },
      {
        $project: {
          propertyObj: 0,
        },
      },
    );
    let PropertyEnuiryArr = await paginateAggregate(PropertyEnuiry, pipeline, req.query);
    res
      .status(201)
      .json({ message: "found all PropertyEnuiry", data: PropertyEnuiryArr.data, total: PropertyEnuiryArr.total });
  } catch (error) {
    next(error);
  }
};

export const getPropertyEnuiryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let pipeline: PipelineStage[] = [];
    let matchObj: Record<string, any> = {};
    if (req.params.id) {
      matchObj._id = new mongoose.Types.ObjectId(req.params.id);
    }
    pipeline.push(
      {
        $match: matchObj,
      },
      {
        $lookup: {
          from: "propertys",
          localField: "propertyId",
          foreignField: "_id",
          as: "propertyObj",
        },
      },
      {
        $unwind: "$propertyObj",
      },
      {
        $addFields: {
          property: "$propertyObj.name",
        },
      },
      {
        $project: {
          propertyObj: 0,
        },
      },
    );
    let existsCheck = await PropertyEnuiry.aggregate(pipeline);
    if (!existsCheck || existsCheck.length == 0) {
      throw new Error("PropertyEnuiry does not exists");
    }
    existsCheck = existsCheck[0];
    res.status(201).json({
      message: "found specific PropertyEnuiry",
      data: existsCheck,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePropertyEnuiryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await PropertyEnuiry.findById(req.params.id).lean().exec();
    if (!existsCheck) {
      throw new Error("PropertyEnuiry does not exists");
    }
    let Obj = await PropertyEnuiry.findByIdAndUpdate(req.params.id, req.body).exec();
    res.status(201).json({ message: "PropertyEnuiry Updated" });
  } catch (error) {
    next(error);
  }
};

export const deletePropertyEnuiryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await PropertyEnuiry.findById(req.params.id).exec();
    if (!existsCheck) {
      throw new Error("PropertyEnuiry does not exists or already deleted");
    }
    await PropertyEnuiry.findByIdAndDelete(req.params.id).exec();
    res.status(201).json({ message: "PropertyEnuiry Deleted" });
  } catch (error) {
    next(error);
  }
};
