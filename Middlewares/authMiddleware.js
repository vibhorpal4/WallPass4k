import jwt from 'jsonwebtoken'
import User from '../Models/userModel.js'

const authMiddleware = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
    }
    try {
        if (!token) {
            return res.status(404).json({ message: `Token not found` })
        }

        const secret = process.env.JWT_SECRET
        const verify = jwt.verify(token, secret)
        if (!verify) {
            return res.status(401).json({ message: `Token Expires` })
        }

        const user = await User.findOne({ _id: verify.id })
        if (!user) {
            return res.status(401).json({ message: `Invalid Access` })
        }
        req.user = user
        next()

    } catch (error) {
        // console.log(error)
        return res.status(500).json(error.message)
    }
}

export default authMiddleware