import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant";
import mongoose from "mongoose";
import { uploadImage2Cloudinary } from "../utils/GlobalUtils";

/**
 * Create new Restaurant
 * @param req
 * @param res
 */
const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    const existingRestaurant = await Restaurant.findOne({ user: req.userId });
    if (existingRestaurant) {
      return res.status(409).json({ message: `Restaurant already exists` });
    }

    // upload image to cloudinary
    let url = await uploadImage2Cloudinary(req.file as Express.Multer.File);

    // add new restaurant
    const newRestaurant = new Restaurant(req.body);
    newRestaurant.imageUrl = url;
    newRestaurant.user = new mongoose.Types.ObjectId(req.userId);
    newRestaurant.lastUpdated = new Date();
    await newRestaurant.save();

    // return result
    res.status(201).send(newRestaurant);
    return;
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({ message: "Something went wrong" });
    } else {
      console.error("Attempt to send response on a completed request", e);
    }
    return;
  }
}

/**
 *
 * @param req
 * @param res
 */
const getMyRestaurant = async (req: Request, res: Response) => {

}

export default { createMyRestaurant, getMyRestaurant };
