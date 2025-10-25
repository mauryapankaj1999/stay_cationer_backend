import { CONFIG } from "common/config.common";
import { ROLES_TYPE } from "common/constant.common";
import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser, User } from "models/user.model";
import { Types } from "mongoose";

export interface RequestWithUser extends Request {
  user: {
    userId: Types.ObjectId;
    role: ROLES_TYPE;
    user: IUser;
  };
}
export const authorizeJwt: RequestHandler = async (req, res, next) => {
  console.log("In middle ware");
  try {
    const authorization = req.headers["authorization"];
    let token = authorization && authorization.split("Bearer ")[1];
    if (!token && typeof req.query.token == "string") {
      token = req.query.token;
    }

    // console.log(token)
    // console.log(process.env.JWT_ACCESS_TOKEN_SECRET)
    // Verify token
    const decoded: any = jwt.verify(`${token}`, CONFIG.JWT_ACCESS_TOKEN_SECRET);
    // Add user from payload
    if (decoded) {
      (req as RequestWithUser).user = decoded;
    }

    if ((req as RequestWithUser).user) {
      let userObj = await User.findById(decoded.userId).exec();
      if (userObj) {
        (req as RequestWithUser).user = {
          userId: userObj?._id,
          role: userObj?.role,
          user: userObj,
        };
      }
    }

    next();
  } catch (e) {
    console.log(e);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export const setUserAndUserObj: RequestHandler = async (req, res, next) => {
  // console.log(req.headers, "IN SET_USER_OBJ");

  const authorization = req.headers["authorization"];
  let token = authorization && authorization.split("Bearer ")[1];
  if (!token && typeof req.query.token == "string") {
    token = req.query.token;
  }
  if (token) {
    try {
      const decoded: any = jwt.verify(token, CONFIG.JWT_ACCESS_TOKEN_SECRET);
      if (decoded) {
        req.user = decoded;
      }

      if (req.user) {
        req.user.userObj = await User.findById(decoded.userId).lean().exec();
      }
    } catch (e) {
      console.error(e);
      res.status(401).json({ message: "Invalid Token" });
      return;
    }
  }
  next();
};
