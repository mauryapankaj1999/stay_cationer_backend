import { Enquiry } from "models/enquiry.model";
import { NextFunction, Request, Response } from "express";
import { paginateAggregate } from "utils/paginateAggregate";
import mongoose, { PipelineStage } from "mongoose";
import { SendBrevoMail } from "services/brevoMail.service";
import enquiryGenerator from "helpers/enuiryGenerator";
import generateHTML from "helpers/generateHTML";
import { notification } from "models/notification.model";

export const addEnquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await Enquiry.findOne({ name: req.body.name }).exec();
    if (existsCheck) {
      throw new Error("enquiry already exists");
    }
    const enquiry = await new Enquiry(req.body).save();

    const notificationObj = {
      link: `/enquiry?enquiryId=${enquiry._id}`,
      userName: enquiry?.name,
      id: enquiry._id,
      text: `enquiry  by ${enquiry?.name}`,
      seen: false,
      createdAt: new Date(),
    };
    const notifiy = new notification(notificationObj);
    await notifiy.save();

    let title = " <title>New List Your Home Enquiry - StayCationer</title>";
    let style = `    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        background-color: #f7f7f7;
        color: #333;
        line-height: 1.6;
      }
      .email-container {
        max-width: 700px;
        margin: 25px auto;
        background: #ffffff;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 5px 14px rgba(0, 0, 0, 0.09);
      }
      .header {
        padding: 28px;
        background: linear-gradient(135deg, #FF6B00, #FF9A56);
        text-align: center;
      }
      .logo {
        height: 44px;
        margin-bottom: 18px;
      }
      .greeting {
        font-size: 26px;
        font-weight: 700;
        color: #fff;
        margin: 0;
        letter-spacing: -0.5px;
      }
      .section {
        padding: 32px;
      }
      .message {
        font-size: 17px;
        color: #333;
        margin-bottom: 32px;
      }
      .contact-info {
        font-size: 17px;
        color: #333;
        margin: 32px 0;
        line-height: 1.8;
      }
      .contact-info a {
        color: #FF6B00;
        text-decoration: none;
        font-weight: 600;
      }
      .contact-info a:hover {
        text-decoration: underline;
      }
      .sign-off {
        font-size: 17px;
        color: #333;
        margin-top: 40px;
        line-height: 1.8;
      }
      .footer {
        text-align: center;
        font-size: 15px;
        color: #999;
        padding: 24px 32px;
        border-top: 1px solid #f0f0f0;
        background-color: #fafafa;
        margin-top: 24px;
      }
      .footer p {
        margin: 8px 0;
        line-height: 1.6;
      }
      @media only screen and (max-width: 700px) {
        .email-container {
          width: 100% !important;
          border-radius: 0;
          margin: 0;
        }
        .header {
          padding: 18px 14px;
        }
        .greeting {
          font-size: 22px;
        }
        .section {
          padding: 20px 14px;
        }
        .message {
          font-size: 15px;
          margin-bottom: 24px;
        }
        .contact-info {
          font-size: 15px;
          margin: 24px 0;
        }
        .sign-off {
          font-size: 15px;
          margin-top: 32px;
        }
        .footer {
          font-size: 13px;
          padding: 18px 14px;
          margin-top: 16px;
        }
      }
    </style>`;
    let content = `  <div class="email-container">
      <div class="header">
        <img src="https://staycationer.ebslonserver3.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooterlogo.253266f1.png&w=1920&q=75" alt="StayCationer Logo" class="logo" />
        <h1 class="greeting">Hi there!</h1>
      </div>
      <div class="section">
        <div class="message">
          Thank you for taking the time to fill the form.
        </div>
        <div class="message">
          Our team has received your registration, and we’re excited to have you on board!
        </div>
        <div class="contact-info">
          If you have any questions or want to get in touch with us, you can mail us at
          <a href="mailto:Info@thestaycationer.in">Info@thestaycationer.in</a> or WhatsApp us at
          <a href="tel:+91-7575985757">+91-7575985757</a>.
        </div>
        <div class="sign-off">
          We look forward to helping you plan your next staycation!<br />
          Warm Regards,<br />
          Home Acquisitions Team,<br />
          StayCationer
        </div>
      </div>
      <div class="footer">
        <p>This email was created by the StayCationer Team.</p>
        <p>© 2025 StayCationer</p>
      </div>
    </div>`;

    let html = generateHTML(title, content, style);
    const mailSend = await SendBrevoMail(
      "Enuiry Form",
      [{ email: "info@thestaycationer.in", name: "staycationer" }],
      html,
    );

    title = `<title>New List Your Home Submission - StayCationer Team</title>`;
    style = `  <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f8f9fa;
        font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }
      .header {
        background: linear-gradient(135deg, #FF7B25 0%, #FFA500 100%);
        padding: 30px 20px;
        text-align: center;
        color: white;
      }
      .logo {
        height: 40px;
        margin-bottom: 10px;
      }
      .confirmation-title {
        font-size: 28px;
        font-weight: 700;
        margin: 10px 0;
        color: white;
      }
      .section {
        padding: 20px 25px;
        border-bottom: 1px solid #f0f0f0;
      }
      .message {
        font-size: 16px;
        color: #333;
        margin-bottom: 20px;
        line-height: 1.8;
      }
      .section-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }
      .section-icon {
        width: 24px;
        height: 24px;
        margin-right: 10px;
        color: #FF7B25;
      }
      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #FF7B25;
        margin: 0;
      }
      .detail-row {
        display: flex;
        margin-bottom: 10px;
        flex-wrap: wrap;
      }
      .detail-label {
        flex: 1 0 140px;
        font-weight: 600;
        color: #555;
        min-width: 140px;
      }
      .detail-value {
        flex: 2;
        color: #333;
        min-width: 150px;
      }
      .footer {
        padding: 20px;
        text-align: center;
        background-color: #f8f9fa;
        font-size: 12px;
        color: #777;
      }
      @media only screen and (max-width: 600px) {
        .container {
          margin: 0;
          border-radius: 0;
          box-shadow: none;
        }
        .confirmation-title {
          font-size: 24px;
        }
        .section {
          padding: 15px;
        }
        .message {
          font-size: 14px;
          margin-bottom: 16px;
        }
        .detail-label {
          flex: 1 0 100%;
          margin-bottom: 5px;
        }
        .detail-value {
          flex: 1 0 100%;
          padding-left: 15px;
        }
      }
      @media only screen and (max-width: 480px) {
        .header {
          padding: 20px 15px;
        }
        .logo {
          height: 35px;
        }
        .confirmation-title {
          font-size: 22px;
        }
        .section-title {
          font-size: 16px;
        }
      }
      @media only screen and (min-width: 601px) and (max-width: 768px) {
        .container {
          max-width: 90%;
        }
      }
    </style>`;
    content = `  <div class="container">
      <div class="header">
        <img src="https://staycationer.ebslonserver3.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooterlogo.253266f1.png&w=1920&q=75" alt="StayCationer Logo" class="logo" />
        <h1 class="confirmation-title">New List Your Home Submission</h1>
      </div>
      <div class="section">
        <div class="message">
          A new home listing has been received. Please review the details below.
        </div>
      </div>
      <div class="section">
        <div class="section-header">
          <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h2 class="section-title">Submission Details</h2>
        </div>
        <div class="detail-row">
          <div class="detail-label">Name:</div>
          <div class="detail-value">${enquiry?.name}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Email:</div>
          <div class="detail-value">${enquiry?.email}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Phone Number:</div>
          <div class="detail-value">${enquiry?.phone}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Location of Villa:</div>
          <div class="detail-value">${enquiry.locationvilla}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Status of Villa:</div>
          <div class="detail-value">${enquiry?.status}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Number of Rooms:</div>
          <div class="detail-value">${enquiry?.numberofroom}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Type of Property:</div>
          <div class="detail-value">${enquiry?.typeOfProperty}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Photos/Website/Airbnb Link:</div>
          <div class="detail-value">${enquiry?.link}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Message:</div>
          <div class="detail-value">${enquiry?.message}</div>
        </div>
      </div>
      <div class="footer">
        <p>You are receiving this notification as part of the StayCationer Team alerts.</p>
        <p>© 2025 StayCationer</p>
      </div>
    </div>`;

    html = generateHTML(title, content, style);
    const send = await SendBrevoMail(
      "New List Your Home Enquiry",
      [{ email: process.env.ADMIN_EAMIL ?? "", name: "StayCationer Team" }],
      html,
    );
    if (!send) {
      throw new Error("Failed to send email");
    }
    res.status(201).json({ message: "enquiry Created" });
  } catch (error) {
    next(error);
  }
};

export const getAllEnquiry = async (req: any, res: any, next: any) => {
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
    let EnquiryArr = await paginateAggregate(Enquiry, pipeline, req.query);
    res.status(201).json({ message: "found all enquiry", data: EnquiryArr.data, total: EnquiryArr.total });
  } catch (error) {
    next(error);
  }
};

export const getEnquiryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let pipeline: PipelineStage[] = [];
    let matchObj: Record<string, any> = {};
    if (req.params.id) {
      matchObj._id = new mongoose.Types.ObjectId(req.params.id);
    }
    pipeline.push({
      $match: matchObj,
    });
    let existsCheck = await Enquiry.aggregate(pipeline);
    if (!existsCheck || existsCheck.length == 0) {
      throw new Error("enquiry does not exists");
    }
    existsCheck = existsCheck[0];
    res.status(201).json({
      message: "found specific enquiry",
      data: existsCheck,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await Enquiry.findById(req.params.id).lean().exec();
    if (!existsCheck) {
      throw new Error("enquiry does not exists");
    }
    let Obj = await Enquiry.findByIdAndUpdate(req.params.id, req.body).exec();
    res.status(201).json({ message: "enquiry Updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteEnquiryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await Enquiry.findById(req.params.id).exec();
    if (!existsCheck) {
      throw new Error("enquiry does not exists or already deleted");
    }
    await Enquiry.findByIdAndDelete(req.params.id).exec();
    res.status(201).json({ message: "enquiry Deleted" });
  } catch (error) {
    next(error);
  }
};
