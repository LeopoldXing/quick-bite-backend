import Stripe from "stripe";
import { Request, Response } from "express";
import { Restaurant, MenuItemType } from "../models/restaurant";
import Order from "../models/order";

/*  init stripe  */
const STRIPE = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL;

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  restaurantId: string;
};

const stripeWebhookHandler = async (request: Request, res: Response) => {
    console.log(request);
}

/**
 * handle create checkout session and create order
 * @param request
 * @param response
 */
const createCheckoutSession = async (request: Request, response: Response) => {
  try {
    // 1. get the checkout details
    const checkoutInfo: CheckoutSessionRequest = request.body;

    // 2. get the restaurant
    const restaurant = await Restaurant.findById(checkoutInfo.restaurantId);
    if (!restaurant) {
      throw new Error("Fail to create checkout session, restaurant not found");
    }

    // 3. create the order
    const order = new Order({
      restaurant: restaurant,
      user: request.userId,
      status: 'placed',
      deliveryDetails: checkoutInfo.deliveryDetails,
      cartItems: checkoutInfo.cartItems
    })

    // 4. create item list displayed during the checkout in stripe page
    const itemList = createItemList(checkoutInfo, restaurant.menuItems);

    // 5. create checkout session
    const session = await createSession(itemList, 'test', restaurant.deliveryPrice, restaurant._id.toString());
    if (!session.url) {
      return response.status(500).json({ message: "Error creating stripe session" });
    }

    // 6. save the order to database
    await order.save();

    // 7. return session url
    response.json({ sessionUrl: session.url });
  } catch (e) {
    console.error(e);
    response.status(500).json({ message: "Fail to create checkout session" });
  }
}

/**
 * create line items for stripe checkout session
 * @param checkoutInfo
 * @param menuItems
 */
const createItemList = (checkoutInfo: CheckoutSessionRequest, menuItems: MenuItemType[]) => {
  return checkoutInfo.cartItems.map(cartItem => {
    // 1. get the menu item info
    const menuItem = menuItems.find(item => item._id.toString() === cartItem.menuItemId);
    if (!menuItem) {
      throw new Error(`Menu item \"${cartItem.name}\" not found`);
    }

    // 2. create line item
    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: 'cad',
        unit_amount: menuItem.price,
        product_data: {
          name: cartItem.name
        }
      },
      quantity: parseInt(cartItem.quantity)
    }
    return lineItem;
  });
}

/**
 * create stripe checkout session
 * @param lineItems
 * @param orderId
 * @param deliveryPrice
 * @param restaurantId
 */
const createSession = async (lineItems: Stripe.Checkout.SessionCreateParams.LineItem[], orderId: string, deliveryPrice: number, restaurantId: string) => {
  return await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice,
            currency: "cad",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      orderId,
      restaurantId,
    },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
  });
}

export default { createCheckoutSession, stripeWebhookHandler };