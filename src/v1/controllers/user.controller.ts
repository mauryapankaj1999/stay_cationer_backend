import { APPROVE_STATUS, ROLES } from "../../common/constant.common";
import { ERROR } from "../../common/error.common";
import { MESSAGE } from "../../common/messages.common";
import { Request, Response, NextFunction } from "express";
import { comparePassword, encryptPassword } from "../../helpers/bcrypt";
import { storeFileAndReturnNameBase64 } from "../../helpers/fileSystem";
import { generateAccessJwt, generateRefreshJwt } from "../../helpers/jwt";
import { RequestWithUser } from "../../middlewares/auth.middleware";
import { IUser, User } from "../../models/user.model";
import mongoose, { PipelineStage, Types } from "mongoose";
import { verifyRequiredFields } from "../../utils/error";
import { createDocuments, newObjectId, throwIfExist } from "../../utils/mongoQueries";
import { paginateAggregate } from "../../utils/paginateAggregate";
import { OTP } from "../../models/otp.model";
import { sendOTP } from "../../helpers/SendSMS";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const webLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const UserExistCheck = await User.findOne({
      email: new RegExp(`^${req.body.email}$`),
    }).exec();

    if (!UserExistCheck) {
      throw new Error(`User Does Not Exist`);
    }

    if (UserExistCheck && UserExistCheck?.status == APPROVE_STATUS.DENIED) {
      throw new Error(`Your account is rejected by admin. Please Contact to Admin`);
    }

    const passwordCheck = await comparePassword(UserExistCheck.password, req.body.password);
    if (!passwordCheck) {
      throw new Error(`Invalid Credentials`);
    }

    if (UserExistCheck.status !== APPROVE_STATUS.APPROVED && UserExistCheck.status !== "active") {
      throw new Error(`Your account is not approved by admin. Please Contact to Admin`);
    }

    const token = await generateAccessJwt({
      userId: UserExistCheck._id,
      role: UserExistCheck.role,
      user: {
        fullName: UserExistCheck.fullName,
        lastName: UserExistCheck.lastName,
        email: UserExistCheck.email,
        phone: UserExistCheck.phone,
        _id: UserExistCheck._id,
      },
    });

    res.status(200).json({
      message: "User Logged In",
      token,
      user: {
        fullName: UserExistCheck.fullName,
        lastName: UserExistCheck.fullName,
        email: UserExistCheck.email,
        phone: UserExistCheck.phone,
        role: UserExistCheck.role,
        _id: UserExistCheck._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // console.log(req.body);

    if (!req.body?.email) {
      throw { status: 401, message: "" };
    }
    const userObj = await User.findOne({
      email: new RegExp(`^${req.body.email}$`),
    })
      .lean()
      .exec();
    if (!userObj) {
      throw { status: 401, message: "user Not Found" };
    }

    // if (!verifyRefreshTokenJwt(req.body.email, req.body.refresh)) {
    //   throw { status: 401, message: "Refresh Token is not matched" };
    // }

    let accessToken = await generateAccessJwt({
      userId: userObj._id,
      role: ROLES.USER,
      fullName: userObj.fullName,
      lastName: userObj.lastName,
      phone: userObj.phone,
      email: userObj.email,
    });
    let refreshToken = await generateRefreshJwt({
      userId: userObj._id,
      role: ROLES.USER,
      fullName: userObj.fullName,
      lastName: userObj.lastName,
      phone: userObj.phone,
      email: userObj.email,
    });
    res.status(200).json({
      message: "Refresh Token",
      token: accessToken,
      refreshToken,
      success: true,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { email, phone, password, role, profileImage } = req.body;

    if (role === ROLES.ADMIN) throw new Error(ERROR.ROLE.INSUFFICIENT_PERMISSION);

    const requiredFields: any = {
      Password: password,
      Role: role,
    };

    if (!email && !phone) {
      requiredFields.Email = undefined;
      requiredFields.Phone = undefined;
    }

    verifyRequiredFields(requiredFields);

    if (!Object.values(ROLES).some((ROLE: any) => ROLE == role)) throw new Error(ERROR.ROLE.NOT_FOUND);

    password = await encryptPassword(req.body.password);

    if (email) {
      throwIfExist<IUser>(User, { email, isDeleted: false }, ERROR.USER.EMAIL_BEING_USED);
    }

    if (phone) {
      await throwIfExist<IUser>(User, { phone, isDeleted: false }, ERROR.USER.PHONE_BEING_USED);
    }

    //Additional data from the creater

    // password = await encryptPassword(password);

    if (profileImage) {
      if (typeof profileImage === "string") {
        profileImage = await storeFileAndReturnNameBase64(profileImage);
      } else {
        console.log("profileImage type should be string.");
      }
    }
    let userObj: IUser = {
      ...req.body,
      profileImage,
      password,
    };

    const newUser: any = await createDocuments(User, userObj);

    const data = {
      name: newUser?.name,
      email: newUser?.email,
      phone: newUser?.phone,
      role: newUser?.role,
    };

    res.status(201).json({ message: MESSAGE.USER.CREATED, data, success: true });
  } catch (error) {
    console.log(error, "ERROR IN CREATE USER");
    next(error);
  }
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const UserExistNameCheck = await User.findOne({
    //   name: new RegExp(`^${req.body.name}$`, "i"),
    // }).exec();

    // if (UserExistNameCheck) {
    //   throw new Error(`User with this name Already Exists`);
    // }
    const UserExistEmailCheck = await User.findOne({
      email: new RegExp(`^${req.body.email}$`, "i"),
    }).exec();
    console.log(UserExistEmailCheck, "UserExistEmailCheck");
    if (UserExistEmailCheck) {
      throw new Error(`User with this email Already Exists`);
    }

    const UserExistPhoneCheck = await User.findOne({
      phone: req.body.phone,
    }).exec();
    if (UserExistPhoneCheck) {
      throw new Error(`User with this phone Already Exists`);
    }

    if (req.body.userName && req.body.userName != "") {
      const UserExistUserNameCheck = await User.findOne({
        userName: new RegExp(`^${req.body.userName}$`, "i"),
      }).exec();

      if (UserExistUserNameCheck) {
        throw new Error(`User with this username already exists`);
      }
    }
    req.body.fullName = req.body?.fname;
    req.body.lastName = req.body?.lname;
    req.body.password = await encryptPassword(req.body.password);

    const user = await new User({ ...req.body }).save();

    res.status(201).json({ message: "User Register  Successfully", data: user._id });
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.params.userId, "req.params.userId");
    const user = await User.findByIdAndDelete(req.params.userId).exec();
    res.status(201).json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

export const approveUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, {
      approved: true,
    }).exec();
    res.status(201).json({ message: "User Approved" });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let matchObj: Record<string, any> = { isDeleted: false, role: { $ne: ROLES.ADMIN } };

    // TODO add role checks
    if (req.query.role) {
      matchObj.role = req.query.role;
    }

    if (req.query.isDeleted === "true") {
      matchObj.isDeleted = true;
    }

    if (typeof req.query.search === "string") {
      matchObj.name = { $regex: new RegExp(req.query.search, "i") };
    }

    let pipeline: PipelineStage[] = [
      {
        $match: matchObj,
      },
    ];

    /**
     * Check Is there any sales call for today.
     * SalesManId will get req.userId
     *
     * $Lookup from salesCall.
     *
     *  For today,
     *
     *  sellerId = _id;
     *  userId = req.userId
     */
    if (req?.query?.forSelect) {
      pipeline.push({
        $project: {
          label: "$name",
          value: "$_id",
        },
      });
    }

    console.log(pipeline, "pipline");

    const paginatedusers = await paginateAggregate(User, pipeline, req.query);

    if (req.query.getCountOnly) {
      res.status(200).json({ message: MESSAGE.USER.ALLUSERS, data: [], total: paginatedusers.total });
      return;
    }

    res.status(200).json({ message: MESSAGE.USER.ALLUSERS, data: paginatedusers.data, total: paginatedusers.total });
  } catch (error) {
    console.log(error, "ERROR IN GETUSER");
    next(error);
  }
};

export const getTaggedUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let userId: Types.ObjectId;
    if (req.user?.userObj?.role === ROLES.ADMIN || req.user?.userObj?.role === ROLES.SUBADMIN) {
      userId = new mongoose.Types.ObjectId(req.params.id);
    } else {
      userId = req.user?.userObj?._id;
    }

    let matchObj: Record<string, any> = {};

    if (typeof req.query.role != "string" || !Object.keys(ROLES).includes(req.query.role)) {
      throw new Error(ERROR.ROLE.NOT_FOUND);
    }

    matchObj.role = req.query.role;

    /**
     * Getting Tags
     */

    let tagsGetUserIdPipeLine: PipelineStage[] = [
      {
        $match: {
          storeId: userId,
          role: req.query.role,
        },
      },
    ];

    let data: { data: any[]; total: number } = {
      data: [],
      total: 0,
    };

    const paginatedusers = await paginateAggregate(User, tagsGetUserIdPipeLine, req.query);

    // if (req.query.getCountOnly) {
    //   res.status(200).json({ message: MESSAGE.USER.ALLUSERS, data: [], total: paginatedusers.total });
    //   return;
    // }

    res.status(200).json({ message: MESSAGE.USER.ALLUSERS, data: paginatedusers.data, total: paginatedusers.total });
  } catch (error) {
    console.log(error, "ERROR IN GETUSER");
    next(error);
  }
};
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.user, "req.user");
    res.json({ message: "User Data", data: req.user.user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const obj: any = {};
    if (req.body.name) {
      obj.name = req.body.name;
    }
    if (req.body.password && req.body.password != "") {
      obj.password = await encryptPassword(req.body.password);
    } else {
      delete obj.password;
    }
    if (req.body.email) {
      const user = await User.find({
        email: new RegExp(`^${req.body.email}$`, "i"),
        _id: { $ne: (req as RequestWithUser).user?.userId },
      }).exec();
      if (user.length) {
        throw new Error("This email is already being used");
      }

      obj.email = req.body.email;
    }
    if (req.body.address) {
      obj.address = req.body.address;
    }
    // if (req.body.name) {
    //   obj.name = req.body.name;
    // }

    const user = await User.findByIdAndUpdate((req as RequestWithUser).user?.userId, obj, {
      new: true,
    }).exec();
    console.log(req.body, user);
    if (!user) throw new Error("User Not Found");
    res.json({ message: "Updated" });
  } catch (error) {
    next(error);
  }
};
export const updateUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req?.params?.id).exec();
    if (!user) {
      throw new Error("User does not exists");
    }

    let phoneExists = await User.findOne({
      phone: new RegExp(`^${req.body.phone}$`, "i"),
      _id: { $ne: new mongoose.Types.ObjectId(req.params.id) },
    })
      .lean()
      .exec();
    console.log(phoneExists, "phoneExists");
    if (phoneExists) {
      throw new Error("Phone number already registered.");
    }
    if (req.body.email && req.body.email != "") {
      let emailExists = await User.findOne({
        email: new RegExp(`^${req.body.email}$`, "i"),
        _id: { $ne: new mongoose.Types.ObjectId(req.params.id) },
      })
        .lean()
        .exec();
      if (emailExists) {
        throw new Error("Email already registered.");
      }
    }

    if (req.body.password && req.body.password != "") {
      req.body.password = await encryptPassword(req.body.password);
    } else {
      delete req.body.password;
    }

    await User.findByIdAndUpdate(req?.params?.id, req.body, {
      new: true,
    }).exec();
    console.log(req.body, user);
    if (!user) throw new Error("User Not Found");
    res.json({ message: "Updated" });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user: any = await User.findById(req?.params?.id).lean().exec();
    if (!user) {
      throw new Error("User does not exists");
    }

    res.json({ message: "found user", data: user });
  } catch (error) {
    next(error);
  }
};

export const registerUserWithPhone = async (req: Request, res: Response, next: NextFunction) => {
  const UserExistPhoneCheck = await User.findOne({
    phone: req.body.phone,
  }).exec();

  if (UserExistPhoneCheck) {
    return res.status(404).json({ message: "User with this phone Already Exist" });
  }
  const { phone } = req.body;

  if (!phone) {
    return res.status(404).json({ message: "Mobile number is required" });
  }

  try {
    // Save OTP to the database

    const otpcheck = await OTP.findOne({ phone }).lean();
    const otp = phone.substring(0, 6) || generateOTP();
    console.log(otpcheck);
    if (!otpcheck) {
      const Otp = await OTP.create({ phone, otp });
    } else {
      throw new Error(`OTP already Sent successfully`);
    }

    // // Send OTP via Twilio
    // await client.messages.create({
    //   body: `Your OTP is: ${otp}`,
    //   from: 'your_twilio_phone_number',
    //   to: mobileNumber,
    // });
    console.log(otp);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    next(err);
  }
};

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { phone } = req.body;

  try {
    if (!phone) {
      return res.status(400).json({ message: "Mobile number is required" });
    }
    const otp = generateOTP();
    await OTP.deleteMany({ phone });
    await OTP.create({ phone, otp });

    const sent = await sendOTP({ number: phone, otp });
    console.log("🚀 -------------------------🚀");
    console.log("🚀 ~ sendOtp ~ sent:", sent);
    console.log("🚀 -------------------------🚀");
    res.send({ message: "OTP sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, otp } = req.body;

  try {
    // Find the OTP in the database
    const otpRecord = await OTP.findOne({ phone, otp });
    const userExists = await User.findOne({ phone }).exec();

    if (!otpRecord) {
      throw new Error("Invalid OTP");
    }

    let user = null;

    if (userExists) {
      user = userExists;
    } else {
      user = await new User({ phone, role: ROLES.USER }).save();
    }

    await OTP.deleteOne({ phone, otp });
    const token = await generateAccessJwt({
      userId: user._id,
      role: user.role,
      user: {
        fullName: user.fullName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        _id: user._id,
      },
    });

    res.status(200).json({
      message: "User Logged In",
      token,
      user: {
        fullName: user.fullName,
        lastName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        _id: user._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { phone } = req.body;

  try {
    if (!phone) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    const otpRecord = await OTP.findOne({ phone }).lean();

    if (otpRecord) {
      await OTP.deleteOne({ phone });
    }

    const otp = generateOTP();
    await OTP.create({ phone, otp });

    const sent = await sendOTP({ number: phone, otp });
    console.log("🚀 ------------------------------------🚀");
    console.log("🚀 ~ loginUserWithPhone ~ sent:", sent);
    console.log("🚀 ------------------------------------🚀");
    res.send({ message: "OTP sent successfully" });
  } catch (error) {
    next(error);
  }
};
