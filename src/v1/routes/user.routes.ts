import express from "express";
import { sendOTP } from "helpers/SendSMS";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  webLogin,
  approveUserById,
  deleteUserById,
  getAllUsers,
  getProfile,
  getUserById,
  refreshToken,
  registerUser,
  updateProfile,
  updateUserById,
  createUser,
  getTaggedUsers,
  registerUserWithPhone,
  verifyOtp,
  sendOtp,
  resendOtp,
} from "v1/controllers/user.controller";

const router = express.Router();

router.post("/login", webLogin);

// Route for user registration
router.post("/register", registerUser);
router.post("/", createUser);

// Route for getting all users
router.get("/", getAllUsers);
router.get("/getProfile", authorizeJwt, getProfile);

// Route for deleting a user by ID

router.post("/refreshToken", refreshToken);
// Route for approving a user by ID
router.patch("/approveUserById/:userId", approveUserById);

// Route for getting user profile (restricted by JWT authorization)
router.get("/getProfile", getProfile);
router.get("/getStoreTaggedUsers/:id", getTaggedUsers);

// Route for updating user profile (restricted by JWT authorization)
router.patch("/updateProfile", updateProfile);

// Route for getting a user by ID
router.get("/getById/:id", getUserById);

// Route for updating a user by ID
router.patch("/updateById/:id", updateUserById);

router.post("/register/phone", registerUserWithPhone);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/resendOtp", resendOtp);

router.delete("/deleteById/:userId", deleteUserById);

// Exporting the router instance to make it available for use in other modules
export default router;
