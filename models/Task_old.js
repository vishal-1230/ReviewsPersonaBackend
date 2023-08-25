import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tasks: {
        type: [{
            title: { type: String, required: true },
            done: { type: Boolean, required: true, default: false },
            priority: { type: Number, required: false, default: 0 },
        }],
        required: false
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)
export default Task