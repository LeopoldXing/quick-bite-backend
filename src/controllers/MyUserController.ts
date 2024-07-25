import { Request, Response } from 'express';
import User from "../models/user";

/**
 * get current user by id
 * @param req
 * @param res
 */
const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findOne({ _id: req.userId });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userResponse = {
      auth0Id: currentUser.auth0Id,
      email: currentUser.email,
      name: currentUser.name,
      addressLine1: currentUser.addressLine1,
      city: currentUser.city,
      country: currentUser.country
    };

    res.json(userResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}


/**
 * create the current user
 * @param req
 * @param res
 */
const createCurrentUser = async (req: Request, res: Response) => {
  console.log("creating the current user")
  try {
    // 1. check if the user exist
    const { auth0Id, email } = req.body;
    const existingUser = await User.findOne({ auth0Id });
    if (existingUser) {
      return res.status(200).send();
    }

    // 2. create the user
    const newUser = new User({ auth0Id: auth0Id, email: email });
    await newUser.save();

    console.log("new user", newUser);

    // 3. return user object
    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating user" });
  }
}

/**
 * update the current user info
 * @param req
 * @param res
 */
const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const { name, addressLine1, country, city } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      // 1. user not found
      return res.status(404).json({ message: "User not found" });
    }

    // 2. user found
    user.name = name;
    user.addressLine1 = addressLine1;
    user.country = country;
    user.city = city;

    // 3. save to database
    await user.save();

    // 4. send response
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating user" });
  }
}

export default {
  createCurrentUser,
  updateCurrentUser,
  getCurrentUser
}
