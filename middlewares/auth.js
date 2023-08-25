import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// auth middleware
export const auth = async (req, res, next) => {
    try {
        // console.log(req.headers)
        const token = req.headers.token

        // console.log(token)
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' })
        } else {
            jwt.verify(token, process.env.JWT_SECRET, async(err, decoded) => {
                console.log("Decoded", decoded)
                if (err) {
                    return res.status(401).json({ message: 'Token is not valid' })
                } else {
                    const user = await User.findById(decoded.id).select('-password')
                    req.user = user
                    next()
                }
            })
        }       
    } catch (error) {
        console.log(error)
    }
}