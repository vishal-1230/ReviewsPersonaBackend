import Card from "../models/Card.js";
import Device from "../models/Device.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { WooCommerce } from "../server.js";
import {logger} from "../server.js"

export const getDevices = async (req, res) => {
    // const devices = await Device.find({});
    const devices = await WooCommerce.get("products");
    res.json(devices);
}

export const getDevice = async (req, res) => {
    const device = await Device.findById(req.params.id);
    if (device) {
        res.json(device);
    } else {
        res.status(404).json({ message: 'Device not found' });
        logger.debug('Device not found');
    }
}

export const linkCard = async (req, res) => {

    try {
        const card = await Card.findOne({ id: req.body.cardId })
    
        if (card) {
            const manager = await User.findById(req.user._id);
            card.manager = manager._id;
            card.activated = false;
            card.redirectionUrl = "";
            const updatedCard = await card.save();
            res.status(201).json(updatedCard);
        } else {
            res.status(404).json({ message: 'Card not found' });
            logger.debug('Card not found');
        }
    } catch (error) {
        res.status(404).json({ message: 'Card not found' })
        logger.debug("ERROR", error);
    }
}

export const unlinkCard = async (req, res) => {

    try {
        const card = await Card.findOne({ id: req.body.cardId });

        if (card) {
            card.manager = null;
            card.activated = false;
            card.redirectionUrl = null;
            const updatedCard = await card.save();
            res.status(200).json(updatedCard);
        } else {
            res.status(404).json({ message: 'Card not found' });
            logger.debug('Card not found');
        }
    } catch (error) {
        res.status(404).json({ message: 'Card not found' })
        logger.debug("ERROR", error);
    }
}

export const activateCard = async (req, res) => {
    logger.debug(req.body)
    const card = await Card.findOne({id: req.body.cardId});
    const redirectionUrl = req.body.redirectionUrl;
    const type = req.body.type;

    if (card.manager.equals(req.user._id)) {
        if (card) {
            card.activated = true;
            card.redirectionUrl = redirectionUrl;
            card.type = type;
            const updatedCard = await card.save();
            res.json(updatedCard);
        } else {
            res.status(404).json({ message: 'Card not found' });
            logger.debug('Card not found');
        }
    } else {
        res.status(401).json({ message: 'Unauthorized' });
        logger.debug('Unauthorized');
    }
}

export const getCards = async (req, res) => {
    try {
        const cards = await Card.find({ manager: req.user._id });
        res.json(cards);
    } catch (error) {
        res.status(404).json({ message: 'Cards not found' })
        logger.debug("ERROR");
    }
}

export const getCard = async (req, res) => {
    const card = await Card.findOne({ id: req.params.id });
    logger.debug("Checking card", req.params)
    if (card) {
        card.taps += 1;
        await card.save();
        // res.status(200).json(card);
        res.redirect(card.redirectionUrl);
    } else {
        res.status(404).json({ message: 'Card not found' });
        logger.debug('Card not found');
    }
}