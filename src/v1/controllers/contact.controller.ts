import { Contact } from "models/contact.model";
import { NextFunction, Request, Response } from "express";
import { paginateAggregate } from "utils/paginateAggregate";
import mongoose, { PipelineStage } from "mongoose";
import { SendBrevoMail } from "services/brevoMail.service";
import enquiryGenerator from "helpers/enuiryGenerator";
import generateHTML from "helpers/generateHTML";
import { notification } from "models/notification.model";

export const addContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("req.body", req.body);
    const contactData = await new Contact(req.body).save();

    const notificationObj = {
      link: `/ContactUs?contactId=${contactData._id}`,
      userName: contactData?.fname,
      id: contactData._id,
      text: `contact enquiry by ${contactData?.fname}`,
      seen: false,
      createdAt: new Date(),
    };
    const notifiy = new notification(notificationObj);
    await notifiy.save();
    let title = "<title>Contact Us Form Submission - StayCationer</title>";
    let style = `   <style>
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
    let content = `   <div class="email-container">
      <div class="header">
        <img src="https://staycationer.ebslonserver3.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooterlogo.253266f1.png&w=1920&q=75" alt="StayCationer Logo" class="logo" />
        <h1 class="greeting">Hi there!</h1>
      </div>
      <div class="section">
        <div class="message">
          Thank you for reaching out to us! We’ve received your message through the Contact Us form, and our team will get back to you soon.
        </div>
        <div class="contact-info">
          In the meantime, if you have any urgent queries, you can reach us at
          <a href="mailto:Info@thestaycationer.in">Info@thestaycationer.in</a> or WhatsApp us at
          <a href="tel:+91-7575985757">+91-7575985757</a>.
        </div>
        <div class="sign-off">
          We look forward to assisting you!<br />
          Warm Regards,<br />
          StayCationer Team
        </div>
      </div>
      <div class="footer">
        <p>This email was created by the StayCationer Team.</p>
        <p>© 2025 StayCationer</p>
      </div>
    </div>`;

    let html = generateHTML(title, content, style);

    const mailSend = await SendBrevoMail("contact Form", [{ email: contactData.email, name: "contact form" }], html);
    if (!mailSend) {
      throw new Error("Mail not sent");
    }
    res.status(201).json({ message: "enquiry Created" });
  } catch (error) {
    next(error);
  }
};

export const getAllContact = async (req: any, res: any, next: any) => {
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
    let ContactArr = await paginateAggregate(Contact, pipeline, req.query);
    res.status(201).json({ message: "found all enquiry", data: ContactArr.data, total: ContactArr.total });
  } catch (error) {
    next(error);
  }
};

export const getContactById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let pipeline: PipelineStage[] = [];
    let matchObj: Record<string, any> = {};
    if (req.params.id) {
      matchObj._id = new mongoose.Types.ObjectId(req.params.id);
    }
    pipeline.push({
      $match: matchObj,
    });
    let existsCheck = await Contact.aggregate(pipeline);
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

export const updateContactById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await Contact.findById(req.params.id).lean().exec();
    if (!existsCheck) {
      throw new Error("enquiry does not exists");
    }
    let Obj = await Contact.findByIdAndUpdate(req.params.id, req.body).exec();
    res.status(201).json({ message: "enquiry Updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteContactById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await Contact.findById(req.params.id).exec();
    if (!existsCheck) {
      throw new Error("enquiry does not exists or already deleted");
    }
    await Contact.findByIdAndDelete(req.params.id).exec();
    res.status(201).json({ message: "enquiry Deleted" });
  } catch (error) {
    next(error);
  }
};
