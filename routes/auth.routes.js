import express from 'express';
import { loginUser, registerUser, verifyUser } from '../controllers/auth.controller.js';

const userRouter = express.Router();

userRouter.post('/register' , registerUser);
userRouter.post('/verify/:token', verifyUser);
userRouter.post('/login' , loginUser);

export default userRouter