import {  ROLES } from "common/constant.common";
import { encryptPassword } from "helpers/bcrypt";
import { Page } from "models/page.model";
import { User } from "models/user.model";
import { createDocuments, newObjectId } from "utils/mongoQueries";

export const homeSeeder = async () => {
  try {
    const homeExist = await Page.findOne({ type:'HOME' }).exec();
    if (homeExist) {
      console.log("EXISTING ADMIN", homeExist.type);
      return "Admin already exists";
    }
    console.log("creating user");

    await new Page({
      name: "Home",
      type: "HOME",
    }).save();
  } catch (error) {
    console.error(error);
  }
};
