import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/errorMiddlewares.js";
import userRoutes from "./routes/userRoutes.js";
import leadsRoutes from "./routes/leadsRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import Device from "./models/Device.js";
import multer from "multer";
import path from "path";
import { auth } from "./middlewares/auth.js";
import User from "./models/User.js";
import Card from "./models/Card.js";
import log4js from "log4js";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import fs from "fs";

log4js.configure({
    appenders: { everything: { type: 'file', filename: 'logs.log' } },
    categories: { default: { appenders: ['everything'], level: 'ALL' } }
  });
  
export const logger = log4js.getLogger();

dotenv.config();

await connectDB();

const app = express();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        logger.debug("REQ", req)
        logger.debug("File", file)
        const folder = file.fieldname === 'image' ? 'public/uploads' : 'public/logos'
        cb(null, folder)
    },
    filename(req, file, cb) {
        cb(null, `${file.originalname}`)
    }
})

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(extname && mimetype) {
        return cb(null, true)
    } else {
        cb('Images only!')
    }
}
const upload = multer({
    storage,
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb)
    }
})
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static("public"));
app.use("/admin-logs", express.static("logs.log"))

// woocommercerestapi
export const WooCommerce = new WooCommerceRestApi.default({
    url: "https://personasmartcard.com",
    consumerKey: "ck_16676d028f9caf2f0ba09063734b93ec0d6fdda5",
    consumerSecret: "cs_7c82b79cbb0a5959e5b8ae7aedaa333b1a852d24",
    version: "wc/v3"
  });

app.post("/api/users/uploadProfileImage", auth, upload.single('image'), async (req, res) => {
    logger.debug("REQs", req.files)
    logger.debug(req.body)
    logger.debug("REQ", req.file)

    const user = await User.findById(req.user._id);
    const file = req.file

    if (user) {
        if (file) {
            user.profilePhoto = file.path.replace('public', '/assets')
            const updatedUser = await user.save();
            res.status(200).json({updatedUser});
        } else {
            res.status(404).json({ message: 'File not found' });
            logger.debug('No file found');
        }
    } else {
        res.status(404).json({ message: 'User not found' });
        logger.debug('User not found');
    }
})

app.post("/api/users/uploadCompanyLogo", auth, upload.single('image'), async (req, res) => {
    logger.debug("REQs", req.files)
    logger.debug(req.body)
    logger.debug("REQ", req.file)

    const user = await User.findById(req.user._id);
    const file = req.file

    if (user) {
        if (file) {
            user.companyLogo = file.path.replace('public', '/assets')
            const updatedUser = await user.save();
            res.status(200).json({updatedUser});
        } else {
            res.status(404).json({ message: 'File not found' });
            logger.debug('No file found');
        }
    } else {
        res.status(404).json({ message: 'User not found' });
        logger.debug('User not found');
    }
})

app.post("/api/users/uploadQrLogo", auth, upload.single('qrLogo'), async (req, res) => {
    logger.debug("REQs", req.files)
    logger.debug(req.body)
    logger.debug("REQ", req.file)

    const user = await User.findById(req.user._id);
    const file = req.file

    if (user) {
        if (file) {
            user.qrLogo = file.path.replace('public', '/assets')
            const updatedUser = await user.save();
            res.status(200).json({updatedUser});
        } else {
            res.status(404).json({ message: 'File not found' });
            logger.debug('No file found');
        }
    } else {
        res.status(404).json({ message: 'User not found' });
        logger.debug('User not found');
    }
})

app.use("/api/users", userRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/messages", messageRoutes)
app.use("/api/tasks", taskRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/devices", deviceRoutes);

app.use(express.static(path.join(__dirname, 'build')));

// app.use(notFound);
// app.use(errorHandler);
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

app.get("*", (req, res) => {
    res.status(404).json({ message: "Page not found" });
});

app.post("*", (req, res)=>{
    res.status(404).json({ message: "Page not found" });
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, logger.debug(`Server running on port ${PORT}`));


async function createDevice() {

    const device = new Device({
        name: 'Custom Metallic Card',
        price: 599,
        image: '/assets/devices/cmetallic1.jpg',
        images: ['/assets/devices/cmetallic1.jpg', '/assets/devices/cmetallic2.jpg', '/assets/devices/cmetallic3.jpg', '/assets/devices/cmetallic4.jpg'],
        instock: true,
        miniDescription: 'The Persona Smart Business card is the sleekest product on the market. It is your all in one digital networking tool. Add your own logo to match your business identity.',
        description: 'The Persona Pixel is your all in one digital networking tool. The sleekest and most popular product on the market. Tap your Persona Pixel to the back of any NFC compatible smartphone to instantly share: – Contact info – Social media – Websites – Pictures and PDFs – and MORE. The other person doesn\'t even need the app! You can share direct links to 10 social media platforms, websites and online stores, upload images as well as all of your contact details, web addresses, and location. Individuals can instantly save your contact card directly to their phone, with a simple tap. Cost-effective, the last smart business card you will ever need. Change and update your information as often as you want in a matter of seconds. ongoing product updates. The connect button will automatically share and gather contact details from both parties. Upload images to your Persona profile. Fully customisable to your brand. Save paper and still make connections. What\'s in the box 1 x Persona Smart Business Card 1 x Instruction Manual on Box',
        category: 'Digital',
        rating: 5,
        // reviews: [
        //     {
        //         name: "Johan Van De Scholt",
        //         rating: 5,
        //         comment: "Ive ordered custom cards for my business and if im honest, this has changed the way of networking! Well done chaps!"
        //     },
        //     {
        //         name: "Proxies Seller",
        //         rating: 5,
        //         comment: "Sweet blog! I found it while browsing on Yahoo News. Do you have any suggestions on how to get listed in Yahoo News? I’ve been trying for a while but I never seem to get there! Many thanks"
        //     },
        //     {
        //         name: "Pei Nilges",
        //         rating: 5,
        //         comment: "I was pretty pleased to discover this site. I wanted to thank you for your time for this particularly fantastic read!! I definitely appreciated every bit of it and I have you saved to fav to look at new stuff on your site."
        //     },
        //     {
        //         name: "S8 Plus Cases",
        //         rating: 5,
        //         comment: "I truly appreciate this article post.Thanks Again. Much obliged."
        //     }
        // ],
        characteristics: [
            {
                name: "Colors",
                value: ["Metallic Gold", "Metallic White"]
            },
            {
                name: "Weight",
                value: "0.5 oz"
            }
        ]
    })

    const createdDevice = await device.save()
    logger.debug(createdDevice)
}
// createDevice()

// name: { type: String, required: true },
// price: { type: Number, required: true },
// image: {type: String, required: true},
// images: {type: Array, required: true},
// instock: {type: Boolean, required: true},
// description: {type: String, required: true},
// category: {type: String, required: true},

    // const card = await Card.create({
    //     // company: user.company,
    //     activated: false,
    //     // email: user.email,
    //     // phone: user.phone,
    //     // address: user.address,
    //     // manager: user._id,
    //     device: "64b16ecd6565c8f112ca2b6a",
    // });
    // logger.debug("CARD", card)
//     user.cards.push(card._id);

async function createCards(n=20) {
    const numbers = Array.from({length: n}, (_, i) => i + 1);
    // const devices = await Device.find();
    let deviceIds = [];
    // devices.map((device) => {
    //     deviceIds.push(device._id)
    // })
    logger.debug("Creating", n, "cards")

    await Promise.all(numbers.map(async (user) => {
        // await Promise.all(devices.map(async (device) => {
        const card = new Card({
            activated: false,
        });
        await card.save();
        const deviceIdsList = JSON.parse(fs.readFileSync("./cardIdsList.json", "utf-8"));
        deviceIdsList.push(card.id);
        fs.writeFileSync("./cardIdsList.json", JSON.stringify(deviceIdsList));
        logger.debug("Created card", card._id)
            // user.cards.push(card._id);
        // }))
    }))
}

// createCards()