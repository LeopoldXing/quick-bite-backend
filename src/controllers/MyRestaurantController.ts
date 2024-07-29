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
    } else {
      return res.status(409).json({ message: `Restaurant already exists` });
    }
  } catch (e) {
    res.status(500).json({ message: "Something went wrong" });
  }
}

export default { createMyRestaurant };
