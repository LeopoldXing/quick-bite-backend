import Stripe from "stripe";
import { Request, Response } from "express";
import { Restaurant, MenuItemType } from "../models/restaurant";
import Order from "../models/order";

/*  init stripe  */
const STRIPE = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

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

/**
 * get current user's order list
 * @param request
 * @param response
 */
const getMyOrders = async (request: Request, response: Response) => {
  try {
    const orderList = await Order.find({ user: request.userId }).populate('restaurant').populate('user');

    response.json(orderList);
  } catch (error) {
    console.log(error);
    // @ts-ignore
    response.status(500).json({ message: `Failed to fetch my orders: ${error.message}` });
  }
}

/**
 * use Stripe webhook to update order status
 * @param request
 * @param response
 */
const stripeWebhookHandler = async (request: Request, response: Response) => {
  let event;

  try {
    const sig = request.headers['stripe-signature'];
    event = STRIPE.webhooks.constructEvent(request.body, sig as string, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.log(error);
    // @ts-ignore
    return response.status(400).send({ message: `Webhook error: ${error.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const order = await Order.findById(event.data.object.metadata?.orderId);
    if (!order) {
      return response.status(404).json({ message: "Order status update failed, order not found" });
    }
    order.totalAmount = event.data.object.amount_total;
    order.status = 'paid';
    await order.save();
  }

  return response.status(200).send();
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
    const session = await createSession(itemList, order._id.toString(), restaurant.deliveryPrice, restaurant._id.toString());
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

export default { createCheckoutSession, stripeWebhookHandler, getMyOrders };