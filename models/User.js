import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
    },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true, default: 'user' },
    company: { type: String, required: false },
    profilePhoto: { type: String },
    companyLogo: { type: String },
    profilesLinked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    cardTaps: { type: Number, required: false, default: 0 },
    pro: { type: Boolean, required: true, default: false },
    proExpires: { type: Date, required: false },
    notifications: { type: Array, required: false }, // {title: "title", link: "dfgd"}[]
    showLeadForm: { type: Boolean, required: false, default: true },
    leadFormTemplate: {
        header: { type: String, required: true, default: 'Get in touch' },
        fields: { type: Array, required: true, default: [
            {
                title: 'Name',
                required: true,
            },
            {
                title: 'Email',
                required: true,
            },
            {
                title: 'Phone',
                required: true,
            }
        ]},
        footer: { type: String, required: true , default: 'We will get back to you as soon as possible.'},
    },
    cardDesign: ({ type: Object, required: false, default: {
        profileBackground: "",
        buttonColor: "",
        darkMode: false,
        fontColor: "",
    } }),
    cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
    leads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }],
    views: { type: Number, required: false, default: 0 },
    qrLogo: { type: String, required: false, default: "logos/persona-p.png" },
    viewsTimings: { type: Array, required: false, default: [] },
    messages: [{
        name: { type: String, required: false },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        messages: [{
            message: { type: String, required: false },
            date: { type: Date, required: false },
            sender: { type: String, required: false}
        }]
    }],
    socialConnects: { type: Number, required: false, default: 0 },
    taps: { type: Number, required: false, default: 0 },
    socialsCount: { type: Number, required: false, default: 2 },
    // socials,
    sms: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },        
    address: { type: String, required: false },
    website: { type: String, required: false },
    whatsapp: { type: String, required: false },
    telegram: { type: String, required: false },
    wechat: { type: String, required: false },
    snapchat: { type: String, required: false },
    instagram: { type: String, required: false },
    facebook: { type: String, required: false },
    twitter: { type: String, required: false },
    linkedin: { type: String, required: false },
    tiktok: { type: String, required: false },
    youtube: { type: String, required: false },
    pinterest: { type: String, required: false },
    discord: { type: String, required: false },
    spotify: { type: String, required: false },
    applemusic: { type: String, required: false },
    payfast: { type: String, required: false },
    paypal: { type: String, required: false },
    paystack: { type: String, required: false },
    yoco: { type: String, required: false },
    peachpayments: { type: String, required: false },
    googlereviews: { type: String, required: false },
    customlink: { type: String, required: false },
    file: { type: String, required: false },
    takealot: { type: String, required: false },
    calendly: { type: String, required: false },
    linktree: { type: String, required: false },
    onlyfans: { type: String, required: false },
    opensea: { type: String, required: false },
    bobshop: { type: String, required: false },
    gumtree: { type: String, required: false },
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema)
export default User
