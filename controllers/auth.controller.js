import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendMail.js';


const prisma = new PrismaClient();

export const registerUser = async(req,res) => {
    const { name , email , password,phone} = req.body;

    if(!name || !email || !password || !phone){
        return res.status(400).json({
            success : false,
            message : "All fields are required"
        })
    }

    try {
      const existingUser = await prisma.user.findUnique({
            where : {email}
        })
        
        if(existingUser){
            return res.status(400).json({
                success : false,
                message : "User already exists",
            });
        }
        // hash the password
        const hashedPassword = await bcrypt.hash(password,10);
        const verificationToken = crypto.randomBytes(32).toString("hex")

       const user = await prisma.user.create({
            data : {
                name,
                email,
                phone,
                password : hashedPassword,
                verificationToken
            }
        })
        if(!user){
            return res.status(400).json({
                success : false,
                message : "User registration failed",
            });
        }
      // send mail 
        const link = `${process.env.BASE_URL}/api/v1/users/verify/${verificationToken}`;
        await sendEmail(user.email , "Verify your mail" , `Please click on this link : ${link}`);

        return res.status(200).json({
            success : true,
            message : "User registered successfully",
        });
       
    } catch (error) {
        return res.status(500).json({
            success : false,
            error,
            message : "Registration failed",
        });
    }
}


export const verifyUser = async(req,res) => {
    const {token} = req.params;
    console.log(token);

    if(!token){
        return res.status(400).json({
            success : false,
            message : "Invalid token"
          });
    }
    try {
        const user = await prisma.user.findFirst({
            where : {verificationToken : token}
        })
        if(!user){
            return res.status(400).json({
                success : false,
                message : "Invalid token"
              });
        }
        await prisma.user.update({
            where : {id : user.id},
            data : {
                isVerified : true,
                verificationToken : null
            }
        })
        return res.status(200).json({
            success : true,
            message : "User verified"
          });
    } catch (error) {
        console.log(error);
        
        return res.status(400).json({
            success : false,
            message : "Verfication Failed"
          });
    }
    
}


