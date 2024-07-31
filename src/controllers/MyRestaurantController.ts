import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant";
import mongoose from "mongoose";

const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    const existingRestaurant = await Restaurant.findOne({ user: req.userId });
    if (!existingRestaurant) {
      const newRestaurant = new Restaurant(req.body);
      newRestaurant.user = new mongoose.Types.ObjectId(req.userId);
      newRestaurant.lastUpdated = new Date();
      await newRestaurant.save();

      res.status(201).send(newRestaurant);
      return;
    } else {
      res.status(409).json({ message: `Restaurant already exists` });
      return;
    }
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({ message: "Something went wrong" });
    } else {
      console.error("Attempt to send response on a completed request", e);
    }
    return;
  }

}

export default { createMyRestaurant };
