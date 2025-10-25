import { RequestHandler } from "express";
import { Order } from "models/order.model";

export const IndexGet: RequestHandler = async (req, res, next) => {
  try {
    res.send("Hello World");
  } catch (error) {
    next(error);
  }
};

