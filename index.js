import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

//custom routes
import userRouter from './routes/auth.routes.js';

dotenv.config()

const PORT = process.env.PORT
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended : true}));

app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}))

app.get("/" , (req,res) => {
    res.status(200).json({
        success : true,
        message : "Test route"
    })
})

app.use('/api/v1/users',userRouter);

app.listen(PORT , () => {
    console.log(`Server is listening on port : ${PORT}`);
})