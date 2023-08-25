import mongoose, { Schema } from 'mongoose'

const deviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: {type: String, required: true},
    images: {type: Array, required: true},
    instock: {type: Boolean, required: true},
    miniDescription: {type: String, required: true},
    description: {type: String, required: true},
    category: {type: String, required: true},
    rating: {type: Number, required: false},
    reviews: {
        type: [{
            name: {type: String, required: true},
            rating: {type: Number, required: true},
            comment: {type: String, required: true}
        }],
        required: false
    },
    characteristics: {
        type: [{
            name: {type: String, required: true},
            value: {type: Schema.Types.Mixed, required: true}
        }],
        required: true
    }
}, {
    timestamps: true
})

const Device = mongoose.model('Device', deviceSchema)
export default Device
    