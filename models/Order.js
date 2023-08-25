import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    cart: { type: Array, required: true }, // {id: "id", quantity: 2, price: 19}[]
    total: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, required: true, default: 'pending' }, // pending, shipped, delivered, cancelled
    deliveredAt: { type: Date },
    // not in use for now:
    paymentMethod: { type: String, required: true },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
}, {
    timestamps: true,
})

const Order = mongoose.model('Order', orderSchema)
export default Order