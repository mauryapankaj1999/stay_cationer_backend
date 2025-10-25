import { adminSeeder } from "./adminSeeder";
import { homeSeeder } from "./homeSeeder";

export const seedData = () => {
  adminSeeder();
  homeSeeder();
};
