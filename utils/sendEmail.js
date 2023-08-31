import nodemailer from 'nodemailer';
import {logger} from "../server.js"

export const sendEmail = async (options, cb=()=>{return}) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: "yhjxanzyrghratwm",
            },
        });

        const message = {
            from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        const info = await transporter.sendMail(message);

        logger.debug('Message sent: %s', info.accepted);
        cb()
    } catch (error) {
        logger.debug(error);
    }
};