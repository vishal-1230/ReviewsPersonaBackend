import mongoose from 'mongoose'

const cardSchema = new mongoose.Schema({
    company: { type: String, required: false },
    activated: { type: Boolean, required: true, default: false },
    // utilities again
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    id: { type: String },
    type: { type: String, required: false, default: "" },
    redirectionUrl: { type: String, required: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    taps: { type: Number, default: 0 },
}, {
    timestamps: true
})

// auto creating 6 digit id for card
cardSchema.pre('save', function(next) {
    let card = this;
    if (!card.id) {
        card.id = Math.floor(100000 + Math.random() * 900000);
    }
    next();
});

const Card = mongoose.model('Card', cardSchema)
export default Card
