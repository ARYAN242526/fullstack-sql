import express from 'express';
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
app.use(express.urlencoded({extended : true}));

app.use(cors({
    origin : process.env.BASE_URL,
    credentials : true
}))


app.use('/api/v1/users',userRouter);

app.listen(PORT , () => {
    console.log(`Server is listening on port : ${PORT}`);
})