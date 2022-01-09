dotenv.config()
import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'


//import Routes
import authRoutes from './Routes/authRoutes.js'
import userRoutes from './Routes/userRoutes.js'
import categoryRoutes from './Routes/categoryRoutes.js'
import imageRoutes from './Routes/imageRoutes.js'



//Initialize server
const app = express()



//middlewares
app.use(express.json({ extended: true }))
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(cookieParser())

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './tmp/'
}));




//routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/image', imageRoutes)


//setting up database
const MONGODB_URL = process.env.MONGODB_URL
mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(console.log(`Database connection successfull`)).catch(err => console.log(err))


//Setting up server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server listening on Port: ${PORT}`)
})