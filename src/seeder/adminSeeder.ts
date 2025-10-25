import {  ROLES } from "common/constant.common";
import { encryptPassword } from "helpers/bcrypt";
import { User } from "models/user.model";
import { createDocuments, newObjectId } from "utils/mongoQueries";

export const adminSeeder = async () => {
  try {
    const encryptedPassword = await encryptPassword("admin@1234");
    const adminExist = await User.findOne({ role: ROLES.ADMIN }).exec();
    if (adminExist) {
      console.log("EXISTING ADMIN", adminExist.email);
      return "Admin already exists";
    }
    console.log("creating user");

    await new User({
      name: "Admin",
      email: "admin@admin.com",
      password: encryptedPassword,
      role: ROLES.ADMIN,
      approved: true,
    }).save();
  } catch (error) {
    console.error(error);
  }
};
