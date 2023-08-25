import mongoose from 'mongoose'

const leadSchema = new mongoose.Schema({
    name: { type: String, required: false },
    fields: {type: Object, required: false},
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
}, {
    timestamps: true
})

const Lead = mongoose.model('Lead', leadSchema)
export default Lead