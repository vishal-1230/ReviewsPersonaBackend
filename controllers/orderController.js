import Card from "../models/Card.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import {logger} from "../server.js"

export const getUserOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
}

export const orderCard = async (req, res) => {
    const user = await User.findById(req.user._id);
    const cart = req.body.cart; // {id: "id", quantity: 2, price: 19}[]
    // total from cart
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const address = req.body.address;

    user.address = address;
    await user.save();

    logger.debug("cart", cart)
    logger.debug("total", total)

    const order = {
        name: user.name,
        address: user.address,
        cart,
        total,
        user: user._id,
        paymentMethod: 'PayPal',
    }
    const createdOrder = await Order.create(order);
    if (createdOrder) {
        user.orders.push(createdOrder._id);
        user.notifications.push({
            title: `Your order of Persona Device has been placed`,
            link: `/admin/cards/orders`,
        });

        // add new cards
        // await Promise.all(cart.map(async (item) => {
        //     const card = await Card.create({
        //         company: user.company,
        //         activated: false,
        //         // email: user.email,
        //         // phone: user.phone,
        //         // address: user.address,
        //         manager: user._id,
        //         device: item.id,
        //     });
        //     user.cards.push(card._id);
        // }))

        // send email
        const options = {
            email: user.email,
            subject: 'Your order of Persona Device has been placed',
            message: `Your order of Persona Device has been placed. Your order number is ${createdOrder._id}. Your order will be shipped to you within 3-5 working days.
                Your order consists of the following items:
                ${cart.map(item => `
                    ${item.quantity} x ${item.name} = R${item.quantity * item.price}
                `)}`,
        };
        sendEmail(options);

        const updatedUser = await user.save();
        res.status(201).json(createdOrder);
    } else {
        res.status(400).json({ message: 'Invalid order data' })
        throw new Error('Invalid order data');
    }
}

export const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
        throw new Error('Order not found');
    }
}

export const deleteOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        await order.remove();
        res.json({ message: 'Order removed' });
    } else {
        res.status(404).json({ message: 'Order not found' });
        throw new Error('Order not found');
    }
}