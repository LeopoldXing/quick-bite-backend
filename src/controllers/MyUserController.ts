import { Request, Response } from 'express';
import User from "../models/user";

/**
 * create the current user
 * @param req
 * @param res
 */
const createCurrentUser = async (req: Request, res: Response) => {
  console.log("creating the current user")
  try {
    // 1. check if the user exist
    const { auth0Id } = req.body;
    const existingUser = await User.findOne({ auth0Id });
    if (existingUser) {
      return res.status(200).send();
    }

    // 2. create the user
    const newUser = new User(req.body);
    await newUser.save();

    // 3. return user object
    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating user" });
  }
}

export default {
  createCurrentUser
}
