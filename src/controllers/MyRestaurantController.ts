import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant";
import mongoose from "mongoose";
import { uploadFile } from "../utils/S3BucketUtil";
import {v4 as uuidv4} from "uuid";

const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    const existingRestaurant = await Restaurant.findOne({ user: req.userId });
    if (existingRestaurant) {
      return res.status(409).json({ message: `Restaurant already exists` });
    }
    const imageBuffer = Buffer.from(req.file?.buffer || "");
    const extension = req.file?.originalname.split('.').pop();
    const filename = `${uuidv4()}.${extension}`;
    const mimetype = req.file?.mimetype || "";

    const url = await uploadFile({
      buffer: imageBuffer,
      filename: filename,
      mimetype: mimetype,
      onProgressUpdate: (progress: number) => {}
    });
    const newRestaurant = new Restaurant(req.body);
    newRestaurant.user = new mongoose.Types.ObjectId(req.userId);
    newRestaurant.lastUpdated = new Date();
    newRestaurant.imageUrl = url;
    await newRestaurant.save();

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

export default { createMyRestaurant };
