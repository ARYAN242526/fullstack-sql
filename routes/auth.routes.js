import express from 'express';
import { loginUser, registerUser, verifyUser,getUser, logoutUser } from '../controllers/auth.controller.js';
import { isLoggedIn } from '../middlewares/auth.middleware.js';

const userRouter = express.Router();

userRouter.post('/register' , registerUser);
userRouter.post('/verify/:token', verifyUser);
userRouter.post('/login' , loginUser);
userRouter.get('/profile' , isLoggedIn, getUser);
userRouter.get('/logout' , isLoggedIn, logoutUser);

export default userRouter