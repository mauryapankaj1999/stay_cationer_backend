import { LoyaltyQuery } from "models/LoyaltyQuery.model";
import { NextFunction, Request, Response } from "express";
import { paginateAggregate } from "utils/paginateAggregate";
import mongoose, { PipelineStage } from "mongoose";
import generateHTML from "helpers/generateHTML";
import { SendBrevoMail } from "services/brevoMail.service";
import { notification } from "models/notification.model";

export const addLoyaltyQuery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await LoyaltyQuery.findOne({ name: req.body.name }).exec();
    if (existsCheck) {
      throw new Error("LoyaltyQuery already exists");
    }
    const loyalty = await new LoyaltyQuery(req.body).save();

    const notificationObj = {
      link: `/loyaltyquery?loyaltyId=${loyalty._id}`,
      userName: loyalty?.name,
      id: loyalty._id,
      text: ` loyalty by ${loyalty?.name}`,
      seen: false,
      createdAt: new Date(),
    };
    const notifiy = new notification(notificationObj);
    await notifiy.save();

    let title = `<title>New Loyalty Registration - StayCationer</title>`;
    let style = ` <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        background-color: #f7f7f7;
        color: #333;
        line-height: 1.5;
      }
      .email-container {
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      .header {
        padding: 24px;
        background: linear-gradient(135deg, #FF6B00, #FF9A56);
        text-align: center;
      }
      .logo {
        height: 40px;
        margin-bottom: 16px;
      }
      .confirmation-title {
        font-size: 24px;
        font-weight: 700;
        color: #fff;
        margin: 0;
        letter-spacing: -0.5px;
      }
      .hero-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        display: block;
      }
      .section {
        padding: 24px;
      }
      .highlight-box {
        background-color: #FFF4ED;
        border-radius: 8px;
        padding: 20px;
        font-size: 16px;
        color: #333;
        margin-bottom: 24px;
        border-left: 4px solid #FF6B00;
        box-shadow: 0 2px 8px rgba(255, 107, 0, 0.08);
      }
      .highlight-box strong {
        color: #FF6B00;
      }
      .section-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #eee;
      }
      .section-icon {
        width: 24px;
        height: 24px;
        color: #FF6B00;
        margin-right: 12px;
      }
      .section-title {
        font-size: 20px;
        font-weight: 700;
        color: #222;
        margin: 0;
      }
      .details-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .detail-item {
        display: flex;
        align-items: baseline;
        text-align: left;
      }
      .detail-label {
        font-weight: 600;
        color: #666;
        margin-right: 8px;
      }
      .detail-value {
        color: #333;
        font-weight: 500;
      }
      .cta-container {
        text-align: center;
        margin: 32px 0;
      }
      .cta-button {
        display: inline-block;
        padding: 14px 28px;
        background-color: #FF6B00;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(255, 107, 0, 0.2);
      }
      .cta-button:hover {
        background-color: #E05D00;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(255, 107, 0, 0.25);
      }
      .footer {
        text-align: center;
        font-size: 14px;
        color: #999;
        padding: 24px;
        border-top: 1px solid #f0f0f0;
        background-color: #fafafa;
      }
      .footer p {
        margin: 8px 0;
      }
      .disclaimer {
        font-size: 13px;
        color: #999;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #eee;
      }
      @media only screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
          border-radius: 0;
          margin: 0;
        }
        .header {
          padding: 20px 16px;
        }
        .confirmation-title {
          font-size: 20px;
        }
        .hero-image {
          height: 160px;
        }
        .section {
          padding: 20px 16px;
        }
        .details-grid {
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .detail-item {
          text-align: left;
        }
        .detail-label {
          font-weight: 700;
          color: #444;
          margin-right: 8px;
        }
        .detail-value {
          font-weight: 500;
        }
      }
    </style>`;
    let content = `  <div class="email-container">
      <!-- Header -->
      <div class="header">
        <img src="https://staycationer.ebslonserver3.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooterlogo.253266f1.png&w=1920&q=75" alt="StayCationer Logo" class="logo" />
        <h1 class="confirmation-title">New Loyalty Program Registration</h1>
      </div>

      <!-- Hero Image -->
      <!-- <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=200&q=80" alt="Loyalty Program" class="hero-image" /> -->

      <!-- Important Notice -->
      <div class="section">
        <div class="highlight-box">
          <strong>New loyalty program member registered</strong><br />
          A new member has successfully joined the StayCationer Loyalty Program. Below are the submitted details for your review.
        </div>
      </div>

      <!-- Registration Details -->
      <div class="section">
        <div class="section-header">
          <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 class="section-title">Member Details</h2>
        </div>

        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">

Full Name:</span>
            <span class="detail-value">${loyalty?.name}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${loyalty?.email}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Contact Number:</span>
            <span class="detail-value">${loyalty?.phone}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">City:</span>
            <span class="detail-value">${loyalty?.city}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Preferred Travel Type:</span>
            <span class="detail-value">${loyalty?.travelType}</span>
          </div>
         <!-- <div class="detail-item">
            <span class="detail-label">Preferred Plan:</span>
            <span class="detail-value">${loyalty?.travelType}</span>
          </div>  -->
          <!-- <div class="detail-item">
            <span class="detail-label">Preferred Travel Date:</span>
            <span class="detail-value">{{travelDate}}</span>
          </div> -->
        </div>
      </div>

      <!-- CTA -->
      <div class="section">
        <div class="cta-container">
          <a href="https://staycationer.ebslonserver3.com/Loyalty" class="cta-button">View Loyalty Program</a>
        </div>
        <p class="disclaimer">You are receiving this notification as part of the StayCationer Team alerts.</p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>Have questions? Contact the loyalty support team via internal channels.</p>
        <p>© 2025 StayCationer Loyalty Program</p>
      </div>
    </div>`;

    let html = generateHTML(title, content, style);
    const admin = await SendBrevoMail(
      "contact Form",
      [{ email: process.env.ADMIN_EAMIL ?? "", name: "loyalty Enquiry" }],
      html,
    );
    if (!admin) {
      throw new Error("Failed to send email");
    }

    title = ` <title>Welcome to StayCationer Loyalty Program</title>`;
    style = ` <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        background-color: #f7f7f7;
        color: #333;
        line-height: 1.5;
      }
      .email-container {
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      .header {
        padding: 24px;
        background: linear-gradient(135deg, #FF6B00, #FF9A56);
        text-align: center;
      }
      .logo {
        height: 40px;
        margin-bottom: 16px;
      }
      .confirmation-title {
        font-size: 24px;
        font-weight: 700;
        color: #fff;
        margin: 0;
        letter-spacing: -0.5px;
      }
      .section {
        padding: 24px;
      }
      .message {
        font-size: 16px;
        color: #333;
        margin-bottom: 16px;
        line-height: 1.8;
      }
      .section-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #eee;
      }
      .section-icon {
        width: 24px;
        height: 24px;
        color: #FF6B00;
        margin-right: 12px;
      }
      .section-title {
        font-size: 20px;
        font-weight: 700;
        color: #222;
        margin: 0;
      }
      .details-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .detail-item {
        display: flex;
        align-items: baseline;
        text-align: left;
      }
      .detail-label {
        font-weight: 600;
        color: #666;
        margin-right: 8px;
      }
      .detail-value {
        color: #333;
        font-weight: 500;
      }
      .contact-info {
        font-size: 16px;
        color: #333;
        margin: 0;
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
      .cta-container {
        text-align: center;
        margin: 32px 0;
      }
      .cta-button {
        display: inline-block;
        padding: 14px 28px;
        background-color: #FF6B00;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(255, 107, 0, 0.2);
      }
      .cta-button:hover {
        background-color: #E05D00;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(255, 107, 0, 0.25);
      }
      .sign-off {
        font-size: 16px;
        color: #333;
        margin-top: 32px;
        line-height: 1.8;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        color: #999;
        padding: 24px;
        border-top: 1px solid #f0f0f0;
        background-color: #fafafa;
        margin-top: 24px;
      }
      .footer p {
        margin: 8px 0;
        line-height: 1.6;
      }
      @media only screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
          border-radius: 0;
          margin: 0;
        }
        .header {
          padding: 20px 16px;
        }
        .confirmation-title {
          font-size: 20px;
        }
        .section {
          padding: 20px 16px;
        }
        .message {
          font-size: 14px;
          margin-bottom: 12px;
        }
        .section-header {
          margin-bottom: 16px;
          padding-bottom: 8px;
        }
        .section-title {
          font-size: 18px;
        }
        .details-grid {
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .detail-item {
          text-align: left;
        }
        .detail-label {
          font-weight: 700;
          color: #444;
          margin-right: 8px;
        }
        .detail-value {
          font-weight: 500;
        }
        .contact-info {
          font-size: 14px;
          margin: 0;
        }
        .sign-off {
          font-size: 14px;
          margin-top: 24px;
        }
        .footer {
          font-size: 12px;
          padding: 18px 16px;
          margin-top: 16px;
        }
      }
    </style>`;

    content = `<div class="email-container">
      <div class="header">
        <img src="https://staycationer.ebslonserver3.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooterlogo.253266f1.png&w=1920&q=75" alt="StayCationer Logo" class="logo" />
        <h1 class="confirmation-title">Welcome to the StayCationer Loyalty Program!</h1>
      </div>
      <div class="section">
        <div class="message">
          Thank you for joining the StayCationer Loyalty Program! We’re excited to have you on board.
        </div>
        <!-- Commenting out the "Your Details" section -->
        <!--
        <div class="section-header">
          <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 class="section-title">Your Details</h2>
        </div>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Full Name:</span>
            <span class="detail-value">${loyalty?.name}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${loyalty?.email}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Contact Number:</span>
            <span class="detail-value">${loyalty?.phone}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">City:</span>
            <span class="detail-value">${loyalty?.city}</span>
          </div>
        </div>
        -->
        <!-- Commenting out the "Explore Your Benefits" button -->
        <!--
        <div class="cta-container">
          <a href="https://staycationer.ebslonserver3.com/Loyalty" class="cta-button">Explore Your Benefits</a>
        </div>
        -->
        <div class="contact-info">
          If you have any questions, feel free to reach out to us at
          <a href="mailto:Info@thestaycationer.in">Info@thestaycationer.in</a> or WhatsApp us at
          <a href="tel:+91-7575985757">+91-7575985757</a>.
        </div>
        <div class="sign-off">
          We can’t wait to help you plan your next staycation!<br />
          Warm Regards,<br />
          StayCationer Team
        </div>
      </div>
      <div class="footer">
        <p>This email was created by the StayCationer Team.</p>
        <p>© 2025 StayCationer</p>
      </div>
    </div>`;
    html = generateHTML(title, content, style);
    const user = await SendBrevoMail(
      "Loyalty Registration Confirmation",
      [{ email: loyalty?.email as string, name: loyalty?.name as string }],
      html,
    );
    if (!user) {
      throw new Error("Failed to send email to user");
    }

    res.status(201).json({ message: "LoyaltyQuery Created" });
  } catch (error) {
    next(error);
  }
};

export const getAllLoyaltyQuery = async (req: any, res: any, next: any) => {
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
    let LoyaltyQueryArr = await paginateAggregate(LoyaltyQuery, pipeline, req.query);
    res
      .status(201)
      .json({ message: "found all LoyaltyQuery", data: LoyaltyQueryArr.data, total: LoyaltyQueryArr.total });
  } catch (error) {
    next(error);
  }
};

export const getLoyaltyQueryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let pipeline: PipelineStage[] = [];
    let matchObj: Record<string, any> = {};
    if (req.params.id) {
      matchObj._id = new mongoose.Types.ObjectId(req.params.id);
    }
    pipeline.push({
      $match: matchObj,
    });
    let existsCheck = await LoyaltyQuery.aggregate(pipeline);
    if (!existsCheck || existsCheck.length == 0) {
      throw new Error("LoyaltyQuery does not exists");
    }
    existsCheck = existsCheck[0];
    res.status(201).json({
      message: "found specific LoyaltyQuery",
      data: existsCheck,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLoyaltyQueryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await LoyaltyQuery.findById(req.params.id).lean().exec();
    if (!existsCheck) {
      throw new Error("LoyaltyQuery does not exists");
    }
    let Obj = await LoyaltyQuery.findByIdAndUpdate(req.params.id, req.body).exec();
    res.status(201).json({ message: "LoyaltyQuery Updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteLoyaltyQueryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await LoyaltyQuery.findById(req.params.id).exec();
    if (!existsCheck) {
      throw new Error("LoyaltyQuery does not exists or already deleted");
    }
    await LoyaltyQuery.findByIdAndDelete(req.params.id).exec();
    res.status(201).json({ message: "LoyaltyQuery Deleted" });
  } catch (error) {
    next(error);
  }
};
