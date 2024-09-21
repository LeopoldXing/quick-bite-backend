import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant";
import mongoose from "mongoose";
import { uploadImage2Cloudinary } from "../utils/GlobalUtils";
import Order from "../models/order";

/**
 *
 * @param req
 * @param res
 */
const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    return res.status(200).json(restaurant);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching restaurant' })
  }
}

/**
 * query my restaurant's order list
 * @param request
 * @param response
 */
const getMyRestaurantOrders = async (request: Request, response: Response) => {
  try {
    // 1. get restaurant
    const restaurant = await Restaurant.findOne({ user: request.userId });
    if (!restaurant) {
      return response.status(404).json({ message: "Restaurant not found" });
    }

    // 2. get orders
    const orders = await Order.find({ restaurant: restaurant._id }).populate("user").populate('restaurant');

    // 3. return result
    response.json(orders || []);
  } catch (error) {
    console.log(error);
    // @ts-ignore
    response.status(500).json({ message: `Failed to fetch restaurant orders: ${error.message}` });
  }
}

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
 * update my restaurant
 * @param req
 * @param res
 */
const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    // find the restaurant needs to be updated
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      // restaurant not found
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // update the restaurant
    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();

    // update image
    if (req.file) {
      restaurant.imageUrl = await uploadImage2Cloudinary(req.file as Express.Multer.File);
    }

    // persist changes
    await restaurant.save();

    // return result
    return res.status(200).send(restaurant);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error updating my restaurant" });
  }
}

/**
 * update order status
 * @param request
 * @param response
 */
const updateOrderStatus = async (request: Request, response: Response) => {
  try {
    // 1. get the orderId and current status
    const { orderId } = request.params;
    const { status } = request.body;

    // 2. get the order
    const order = await Order.findById(orderId);
    if (!order) {
      return response.status(404).json({ message: `Failed to update order status, order ${orderId} not found` });
    }

    // 3. get the restaurant
    const restaurant = await Restaurant.findById(order.restaurant).populate("user");
    if (!restaurant) {
      return response.status(404).json({ message: `Failed to update order status, Restaurant ${order.restaurant} not found` });
    }
    if (restaurant.user?._id.toString() !== request.userId) {
      return response.status(401).json({ message: "User does not have the authorization to perform this action" });
    }

    // 4. update the order status
    order.status = status;
    await order.save();

    response.status(200).json(order);
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "Fail to update order status" });
  }
}

export default { createMyRestaurant, getMyRestaurant, updateMyRestaurant, getMyRestaurantOrders, updateOrderStatus };
