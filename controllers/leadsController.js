import Card from "../models/Card.js";
import Lead from "../models/Lead.js";
import User from "../models/User.js";
import {logger} from "../server.js"


export const editLeadFormTemplate = async (req, res) => {
    logger.debug(req.body)
    const user = await User.findById(req.user._id);
    if (user) {
        user.leadFormTemplate = req.body.leadFormTemplate || user.leadFormTemplate;
        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            leadFormTemplate: updatedUser.leadFormTemplate,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
        logger.debug('User not found');
    }
}

export const createLead = async (req, res) => {

    const leadData = req.body.leadData;
    const userId = await User.findById(req.body.userId);
    logger.debug(userId)
    if (!userId) {
        res.status(404).json({ message: 'User not found' });
        logger.debug('User not found');
        return
    }
    const user = await User.findById(userId).select('-password');
    const cardId = req.body.cardId;

    const lead = await Lead.create({fields: leadData});
    if (lead) {
        userId.leads.push(lead._id);
        userId.notifications.push({
            title: `New lead from ${lead.Name}`,
            link: `/admin/main/users/users-overview`,
        });
        const updatedUser = await userId.save();
        if (cardId) {
            const card = await Card.findById(cardId);
            if (card) {
                card.leads.push(lead._id);
                const updatedCard = await card.save();
            } else {
                res.status(404).json({ message: 'Card not found' });
                logger.debug('Card not found');
            }
        }
        res.status(200).json(lead);
    } else {
        res.status(400);
        throw new Error('Invalid lead data');
    }
}

export const assignLead = async (req, res) => {
    const lead = await Lead.findById(req.body.leadId);
    const user = await User.findById(req.body.userId);

    if (lead && user) {
        lead.assignedTo = user._id;
        const updatedLead = await lead.save();
        res.status(200).json(updatedLead);
    } else {
        res.status(404).json({ message: 'Lead or user not found' });
        logger.debug('Lead or user not found');
    }
}

export const getLeads = async (req, res) => {    
    const leadsList = await User.findById(req.user._id).populate('leads');
    const leads = await Lead.find({ $or: [{ _id: { $in: leadsList.leads } }, { assignedTo: req.user._id}]});
    logger.debug("LEADS", leads)

    res.status(200).json(leads);
}

export const getLeadById = async (req, res) => {
    const lead = await Lead.findById(req.params.id);
    if (lead) {
        res.json(lead);
    } else {
        res.status(404);
        throw new Error('Lead not found');
    }
}

export const deleteLead = async (req, res) => {

    try {
        const user = await User.findById(req.user._id);
        const lead = await Lead.findById(req.params.id);
        logger.debug("Deleting lead", req.params.id)
    
        if (lead) {
            await Lead.findByIdAndDelete(req.params.id);
            logger.debug("Removed lead")
            user.leads.pull(lead._id);
            logger.debug("Removed lead from user")
            await user.save();
            res.status(200).json({ message: 'Lead removed' });
        } else {
            res.status(404);
            logger.debug('Lead not found');
        }
    } catch (error) {
        res.status(404).json({ message: 'Lead not found' })
        logger.debug('Lead not found');
    }
}