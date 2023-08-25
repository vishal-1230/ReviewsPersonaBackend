import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Task from '../models/Task_old.js';
import TaskNew from '../models/Task.js';
import Card from '../models/Card.js';
import Lead from '../models/Lead.js';
import { sendEmail } from '../utils/sendEmail.js';
import fs from 'fs';
import Order from '../models/Order.js';
import Device from '../models/Device.js';
import axios from 'axios';
import VCardJS from 'vcards-js';
import path from 'path';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const sendOTP = async (req, res) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const { email } = req.body;
    console.log("REQ BODY", req.body)

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    await sendEmail({
        email: email,
        subject: "OTP for PERSONA Password Reset",
        message: `Hey, Your OTP for Password Reset is ${otp}`,
    }, ()=>{
        fs.readFile("otps.json", (err, data) => {
            if (err) {
                console.log(err);
            } else {
                let otps = JSON.parse(data);
                otps.push({ otp, email });
                fs.writeFileSync("otps.json", JSON.stringify(otps));
            }
        })
        console.log("OTP sent")
    })
    res.status(200).json({ message: "OTP sent" });
}

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    fs.readFile("otps.json", (err, data) => {
        if (err) {
            console.log(err);
        } else {
            let otps = JSON.parse(data);
            let found = false;
            otps.map((otpObj) => {
                if (otpObj.otp == otp && otpObj.email == email) {
                    found = true;
                }
            })
            if (found) {
                res.status(200).json({ message: "OTP verified" });
            } else {
                res.status(400).json({ message: "OTP not verified" });
            }
        }
    })
}

export const register = async (req, res) => {
    console.log("register", req.body)
    const { name, email, password, phone, address } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        console.log('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashedPassword", hashedPassword)
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
    });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

export const createProfileByManager = async (req, res) => {
    console.log("register", req.body)

    const manager = await User.findById(req.user._id, "name profilesLinked");
    console.log("manager", manager)
    const { name, email, phone, designation } = req.body;

    let password = Math.random().toString(36).slice(-8);

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        console.log('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashedPassword", hashedPassword)
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role: designation
    });
    console.log("Created user")
    if (user) {
        if (manager.profilesLinked != undefined) {
            manager.profilesLinked.push(user._id);
            console.log("added")
        } else {
            manager['profilesLinked'] = [user._id];
            console.log("created")
        }
        await manager.save();
        console.log("manager", manager)
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id),
        });
        await sendEmail({
            email: email,
            subject: "Welcome to MyPersona",
            message: `Hey ${name}, Welcome to Persona Smart Business Cards. \nYour Account has been created by ${manager.name} on Persona Dashboard. We have generated a Random Password for you (given below) that you can change after logging in if you want! \nYour temporary password is ${password}.\n\n Login at https://mypersona.io/login \n\n Regards, \n Team Persona`
        }, ()=>{
            console.log("Email sent")
        })
    } else {
        res.status(400).json({ message: 'Invalid user data' });
        console.log('Invalid user data');
    }
};

export const getLinkedProfilesDetail = async (req, res) => {
    console.log("getLinkedProfilesDetail", req.body)

    const manager = await User.findById(req.user._id).populate('profilesLinked');
    const linkedProfiles = manager.profilesLinked;
    let profiles = [];
    console.log("manager", manager)
    console.log("linkedProfiles", linkedProfiles)

    if (linkedProfiles && linkedProfiles.length > 0) {
        await Promise.all(linkedProfiles.map(async(profile)=>{
            const user = await User.findById(profile._id).select('-password -orders -notifications');
            profiles.push(user);
        }))

        res.status(200).json(profiles);
        console.log("profiles", profiles)
        
    } else {
        res.status(400).json({ message: 'No profiles found' });
        console.log('No profiles found');
    }
}

export const deleteLinkedProfile = async (req, res) => {
    console.log("deleteLinkedProfile", req.params)

    const manager = await User.findById(req.user._id, "name profilesLinked");
    const { profileId } = req.params;

    if (manager.profilesLinked != undefined) {
        manager.profilesLinked = manager.profilesLinked.filter((profile)=>profile._id.toString() !== profileId.toString());
        console.log("added")
    } else {
        res.status(400).json({ message: 'No profiles found' });
        console.log('No profiles found');
    }
    await manager.save();
    console.log("manager", manager)
    res.status(200).json({ message: 'Profile removed' });
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const isMatch = await bcrypt.compare(password, user.password);

    if (user && isMatch) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        console.log('Invalid email or password');
    }
}

export const changePassword = async (req, res) => {
    console.log("changePass", req.body)

    try {
        const { email, newPassword } = req.body;
    
        const user = await User.findOne({ email });
        console.log("user", user)
        if (user) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();
            res.status(200).json({ message: 'Password changed successfully.' });
        } else {
            res.status(400).json({ message: 'Invalid email' });
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: 'Error Changing Password' });
    }

}

export const getProfile = async (req, res) => {

    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
}

// update about + update socials on card
export const updateUser = async (req, res) => {

    console.log("updateUser", req.body)

    const user = await User.findById(req.user._id);
    const isPro = user.pro;
    if (user) {
        user.name = req.body.name || user.name;
        if (req.body.name) {
            // update in messages in user and other user
            const users = await User.find({ "messages.userId": req.user._id });
            console.log("users", users)
            if (users && users.length > 0) {
                await Promise.all(users.map(async (user) => {
                    user.messages.forEach((message) => {
                        if (message.userId.toString() === req.user._id.toString()) {
                            message.name = req.body.name;
                        }
                    });
                    // await user.save();
                }))
            }
        }
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        user.role = req.body.role || user.role;
        user.profilePhoto = req.body.profilePhoto || user.profilePhoto;
        user.companyLogo = req.body.companyLogo || user.companyLogo;
        user.company = req.body.company || user.company;
        user.coverPhoto = req.body.coverPhoto || user.coverPhoto;
        user.address = req.body.address || user.address;
        user.snapchat = req.body.snapchat || user.snapchat;
        if (req.body.snapchat) {
            user.socialsCount = user.socialsCount+1
        }
        user.sms = req.body.sms || user.sms;
        if (req.body.sms) {
            user.socialsCount = user.socialsCount+1
        }
        if (isPro) {
            user.cardDesign = req.body.cardDesign || user.cardDesign;
            user.qrLogo = req.body.qrLogo || user.qrLogo;
            user.website = req.body.website || user.website;
            user.socialsCount = user.socialsCount + 1;
            user.whatsapp = req.body.whatsapp || user.whatsapp;
            user.telegram = req.body.telegram || user.telegram;
            user.wechat = req.body.wechat || user.wechat;
            user.instagram = req.body.instagram || user.instagram;
            user.facebook = req.body.facebook || user.facebook;
            user.twitter = req.body.twitter || user.twitter;
            user.linkedin = req.body.linkedin || user.linkedin;
            user.tiktok = req.body.tiktok || user.tiktok;
            user.youtube = req.body.youtube || user.youtube;
            user.pinterest = req.body.pinterest || user.pinterest;
            user.discord = req.body.discord || user.discord;
            user.spotify = req.body.spotify || user.spotify;
            user.applemusic = req.body.applemusic || user.applemusic;
            user.payfast = req.body.payfast || user.payfast;
            user.paypal = req.body.paypal || user.paypal;
            user.paystack = req.body.paystack || user.paystack;
            user.yoco = req.body.yoco || user.yoco;
            user.peachpayments = req.body.peachpayments || user.peachpayments;
            user.googlereviews = req.body.googlereviews || user.googlereviews;
            user.customlink = req.body.customlink || user.customlink;
            user.file = req.body.file || user.file;
            user.takealot = req.body.takealot || user.takealot;
            user.calendly = req.body.calendly || user.calendly;
            user.linktree = req.body.linktree || user.linktree;
            user.onlyfans = req.body.onlyfans || user.onlyfans;
            user.opensea = req.body.opensea || user.opensea;
            user.bobshop = req.body.bobshop || user.bobshop;
            user.gumtree = req.body.gumtree || user.gumtree;
        }
        if (req.body.password) {
            const oldPassword = req.body.oldPassword;
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (isMatch) {
                user.password = bcrypt.hashSync(req.body.password, 10)
            } else {
                res.status(401).json({ message: 'Invalid password' });
                console.log('Invalid password');
                return
            }
        }
        const updatedUser = await user.save();
        res.status(200).json({updatedUser});
    } else {
        res.status(404).json({ message: 'User not found' });
        console.log('User not found');
    }
}

export const deleteSocial = async (req, res) => {
    
    try{
        const userId = req.user._id;
        console.log("userId", userId)
        const user = await User.findById(userId);
    
        const social = req.body.social;
        console.log("Deleting social", social)
        if (user) {
            // User.updateOne({ $unset: { [social]: 1 } }, function (err, result) {
            //     if (err) {
            //         res.status(404).json({ message: 'Social not found' });
            //         console.log('Social not found');
            //     } else {
            //         res.status(200).json({ message: 'Social deleted', user: result });
            //     }
            // });
            const updatedUser = await User.findOneAndUpdate({ _id: userId }, { $unset: { [social]: 1 } }, { new: true })
            await User.findOneAndUpdate({ _id: userId }, { socialsCount: user.socialsCount-1 }, { new: true })
            if (updatedUser) {
                res.status(200).json({ message: 'Social deleted', user: updatedUser });
            } else {
                res.status(404).json({ message: 'Social not found' });
                console.log('Social not found');
            }
            // res.status(200).json({ message: 'Social deleted', user: doc });
        } else {
            res.status(404).json({ message: 'User not found' });
            console.log('User not found');
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: 'User not found' });
    }
}

export const getUsers = async (req, res) => {
    
        const users = await User.find({});
        res.json(users);
}

export const getUserById = async (req, res) => {
        try{

            const user = await User.findById(req.params.id).select('-password');
            user.views += 1;
            user.viewsTimings.push(Date.now());
            user.notifications.push({
        title: "Someone just viewed your Digital Card",
        link: "/admin/mypersona"
    })
    await user.save();

    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
        console.log('User not found');
    }
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: 'User not found' });
    }
}

export const deleteUser = async (req, res) => {
                
    const user = await User.findById(req.params.id);
                    if (user) {
                        await user.remove();
                        const cards = await Card.find({ user: req.params.id });
                        // remove user from Card
                        await Card.updateMany({ user: req.params.id }, { $unset: { user: 1 } });
                        res.json({ message: 'User removed' });
                    } else {
                        res.status(404);
                        throw new Error('User not found');
                    }
}

export const addTask_old = async (req, res) => {
    try{
        console.log("Finding id of user", req.user)
        const user = await User.findById(req.user._id);
        const { name, tasks } = req.body;
    
        if (user) {
            const task = new Task({
                name,
                tasks,
                user: req.user._id,
            });
            const createdTask = await task.save();
            user.tasks.push(createdTask._id);
            await user.save();
            res.status(200).json(createdTask);
        } else {
            res.status(404).json({ message: 'User not found' });
            console.log('User not found');
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error });
    }
}

export const addSubTask_old = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        const subTask = {
            title: req.body.name,
            done: false,
            priority: req.body.priority,
        };
        task.tasks.push(subTask);
        await task.save();
        res.status(201).json(task);
    } else {
        res.status(404).json({ message: 'Task not found' });
        console.log('Task not found');
    }
}

export const getTasks_old = async (req, res) => {
    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLl")
    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLl")
    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLl")
    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLl")
    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLl")
    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLl")
    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLl")
    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLl")
    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLl")
    try {
        console.log("Finding id of user", req.user)
        const tasks = await Task.find({ user: req.user._id });
        res.status(200).json(tasks);
    } catch (error) {
        // console.log(error)
        res.status(404).json({ message: "OOf" });
    }
}

export const markTaskAsDone_old = async (req, res) => {

    try {
        const task = await Task.findById(req.params.id);
        if (task) {
            task.tasks.forEach((task) => {
                if (task._id.toString() === req.params.taskId.toString()) {
                    task.done = true;
                }
            });
            await task.save();
            res.status(200).json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
            console.log('Task not found');
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error });
    }
}

export const deleteTask_old = async (req, res) => {
    
        try {
            const task = await Task.findById(req.params.id);
            if (task) {
                await Task.findOneAndDelete({ _id: req.params.id });
                await User.updateOne({ _id: req.user._id }, { $pull: { tasks: req.params.id } });
                res.status(200).json({ message: 'Task removed' });
            } else {
                res.status(404).json({ message: 'Task not found' });
                console.log('Task not found');
            }
        } catch (error) {
            console.log(error)
            res.status(404).json({ message: error });
        }
}

export const deleteTaskId_old = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        task.tasks = task.tasks.filter((task) => task._id.toString() !== req.params.taskId.toString());
        await task.save();
        res.status(200).json({ message: 'Task removed' });
    } else {
        res.status(404).json({ message: 'Task not found' });
        console.log('Task not found');
    }
}

export const getTasks = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            const tasks = await TaskNew.find({ user: req.user._id });
            res.status(200).json(tasks);
            console.log("Sent tasks")
        } else {
            res.status(404).json({ message: 'User not found' });
            console.log('User not found');
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error });
    }
}

export const addTask = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { title, description, priority, backlog } = req.body;
        if (user) {
            const task = new TaskNew({
                title,
                description,
                priority,
                user: req.user._id,
                backlog: backlog ? backlog : false,
            });
            const createdTask = await task.save();
            user.tasks.push(createdTask._id);
            await user.save();
            res.status(201).json(createdTask);
        } else {
            res.status(404).json({ message: 'User not found' });
            console.log('User not found');
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error });
    }
}

export const addToBacklog = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const taskId = req.params.id;

        if (user) {
            const task = TaskNew.findById(taskId);
            if (task) {
                task.backlog = true;
                await task.save();
                res.status(200).json(task);
            } else {
                res.status(404).json({ message: 'Task not found' });
                console.log('Task not found');
            }
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error });
    }
}

export const editTask = async (req, res) => {
    try {
        const task = await TaskNew.findById(req.params.id);
        if (task) {
            task.title = req.body.title ? req.body.title : task.title;
            task.description = req.body.description ? req.body.description : task.description;
            task.priority = req.body.priority ? req.body.priority : task.priority;
            task.backlog = req.body.backlog ? req.body.backlog : task.backlog;
            task.done = req.body.done ? req.body.done : task.done;
            await task.save();
            res.status(200).json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
            console.log('Task not found');
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error });
    }
}

export const markTaskAsDone = async (req, res) => {
    try {
        const task = await TaskNew.findById(req.params.id);
        if (task) {
            task.done = true;
            await task.save();
            res.status(200).json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
            console.log('Task not found');
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error });
    }
}

export const deleteTask = async (req, res) => {
    try {
        const task = await TaskNew.findById(req.params.id);
        if (task) {
            // delete the task
            task.deleteOne();
            res.status(200).json({ message: 'Task removed' });
        } else {
            res.status(404).json({ message: 'Task not found' });
            console.log('Task not found');
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error });
    }
}

export const sendMessage = async (req, res) => {
    console.log("sender", req.user._id)
    console.log("receiver", req.body.userId)
    try {
        const user = await User.findById(req.user._id);
        const { message, userId } = req.body;
        const sender = user.name;
        const newMessage = {
            message,
            date: Date.now(),
            sender: "me"
        }
        const newMessageReceiver = {
            message,
            date: Date.now(),
            sender: "user"

        }
        console.log("Setting msg,", newMessage, newMessageReceiver)
        const receiver = await User.findById(userId);
        if (user) {
            let exists = false;
            user.messages.forEach((message) => {
                if (message.userId.toString() === userId.toString()) {
                    exists = true;
                    message.messages.push(newMessage);
                }
            });
            if (!exists) {
                user.messages.push({
                    name: receiver.name,
                    userId,
                    messages: [newMessage]
                });
            }
            console.log("New user,", user)
            await user.save();
            // res.status(200).json(user);
            if (receiver) {
                let exists = false;
                receiver.messages.forEach((message) => {
                    if (message.userId.toString() === user._id.toString()) {
                        exists = true;
                        message.messages.push(newMessageReceiver);
                    }
                });
                if (!exists) {
                    receiver.messages.push({
                        name: user.name,
                        userId: user._id,
                        messages: [newMessageReceiver]
                    });
                }
                await receiver.save();
                res.status(200).json(user.messages);
            } else {
                res.status(404).json({ message: 'Receiver not found' });
                console.log('Receiver not found');
            }
        } else {
            res.status(404).json({ message: 'Sender not found' });
            console.log('Sender not found');
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error });
    }
}

export const getMessages = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.status(200).json(user.messages);
        } else {
            res.status(404).json({ message: 'User not found' });
            console.log('User not found');
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error });
    }
}

export const upgradeToPro = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.pro = true;
            console.log("Expire", req.body.expiryDate)
            user.proExpires = req.body.expiryDate;
            await user.save();
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
            console.log('User not found');
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error });
    }
}

export const downloadVCard = async (req, res) =>{
    const userId = req.params.id;

    try {
        const vCard = VCardJS();
 
        // set properties
        vCard.firstName = 'Eric';
        vCard.middleName = 'J';
        vCard.lastName = 'Nesser';
        vCard.organization = 'ACME Corporation';
        vCard.role = 'Software Developer';
        vCard.socialUrls = {
            'facebook': 'https://facebook.com/ericnesser',
            'twitter': 'https://twitter.com/ericnesser',
            'linkedin': 'https://linkedin.com/in/ericnesser',
        }
        vCard.email = "abcd@gmail.com"
        const __dirname = path.resolve(path.dirname(''));
        console.log("Dirname", __dirname)
        vCard.logo.embedFromFile(path.join(__dirname, './controllers/Diploma.png'));
        vCard.photo.embedFromFile(path.join(__dirname, './controllers/Diploma.png'));
        vCard.workPhone = '123-456-7890';

        //set content-type and disposition including desired filename
        res.set('Content-Type', 'text/vcard; name="enesser.vcf"');
        res.set('Content-Disposition', 'inline; filename="enesser.vcf"');
        
        // save the file
        // vCard.saveToFile('./enesser.vcf');

        // send the response
        res.send(vCard.getFormattedString());
    } catch (error) {
        console.log("Error: ", error)
        res.status(404).json({ message: error });
    }
}

export const sendWhatsappTrial = async (req, res) => {
    const key = process.env.WA_KEY

    await axios.post(`https://graph.facebook.com/v17.0/117906664728467/messages`, {
        messaging_product: "whatsapp",
        to: "918373958829",
        type: "text",
        text: {
            body: "Hello, world!"
        }
    }, {
        params: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
        }
    }).then(async(response) => {
        console.log(response.data)
        res.status(200).json(response.data)
    })
}