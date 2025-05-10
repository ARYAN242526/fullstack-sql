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


export const loginUser = async(req,res) => {
    const {email , password} = req.body;

    
    if(!email || !password){
        return res.status(400).json({
            success : false,
            message : "All fields are required"
        });
    }
    try {
       const user = await prisma.user.findUnique({
        where : {email}
       })

       if(!user){
        return res.status(400).json({
            success : false,
            message : "Invalid email or password"
        })
       }
      const isMatch = await bcrypt.compare(password , user.password)
      if(!isMatch){
        return res.status(400).json({
            success : false,
            message : "Invalid email or password"
        });
      }

      const token = jwt.sign(
        {id : user.id, role : user.role},
        process.env.JWT_SECRET,
        {expiresIn : '24h'}
    )
    const cookieOptions = {
        httpOnly : true
    }

    res.cookie('token' , token , cookieOptions)

    return res.status(200).json({
        success : true,
        token,
        user : {
            id : user.id,
            name : user.name,
            email : user.email
        },
        message : "Login Successful"
    })


    } catch (error) {
        console.error('Login error : ',error);
        return res.status(500).json({
            success : false,
            message : "Login Failed"
        })
    }

}

export const getUser = async(req,res) => {
    try {
        const user = await prisma.user.findUnique({
            where : {
                id : req.user.id
            }
        })
        if(!user){
            return res.status(400).json({
                success : false,
                message : "User not found",
              });
        }

        res.status(200).json({
            success : true,
            message : "User fetched successfully",
            profile : {
                uid : user.id,
                name : user.name,
                email : user.email,
                role : user.role,
            }
        })
        
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Login Failed",
            error
        }) 
    }
}

export const logoutUser = async(req,res) => {
    try {
        res.cookie("token" , '', {httpOnly : true})

        return res.status(200).json({
            success : true,
            message : "User logged out successfully"
        })
    } catch (error) {
        return res.status(400).json({
            message  : "User logout failed",
            success : false,
            error
          });
    }
}

export const forgotPassword = async(req,res) => {
    try {
        const {email} = req.body;
        
        if(!email) {
            return res.status(400).json({
        success: false,
        message: "Email is required"
       });
     }

        const user = await prisma.user.findUnique({
            where : {email}
        });
        if(!user){
          return res.status(400).json({
        success : false,
        message : "User not found"
        })
        }
        const resetToken =  crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        await prisma.user.update({
            where : {id : user.id},
            data : {
                passwordResetToken : resetTokenHash,
                passwordResetExpiry : new Date(Date.now() + 10 * 60 * 1000).toISOString()
            }
        })

        const resetUrl = `${process.env.BASE_URL}/api/v1/users/reset-password/${resetToken}`;
        await sendEmail(user.email, 'Forgot password' , `Reset password using this link : ${resetUrl}`)

        res.status(200).json({
        success : true,
        message : "Reset email sent"
      })
    } catch (error) {
        console.log(error);
        res.status(500).json({
        success : false,
        message : "Server error"
      })
    }
}

export const resetPassword = async(req,res) => {
    try {
        const {token} = req.params;
        const {newPassword} = req.body;
    
        if(!token || !newPassword){
            return res.status(400).json({
                success : false,
                message : "All fields are required"
            })
        }
    
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
        const user = await prisma.user.findFirst({
            where : {
                passwordResetToken : resetTokenHash
            }
        })
        if(!user){
            return res.status(400).json({
            success : false,
            message : "Invalid or expired token"
          })
        }
    
        await prisma.user.update({
            where : {email : user.email},
            data : {
                password : newPassword,
                passwordResetToken : null,
                passwordResetExpiry : null
            }
    
        })
         res.status(200).json({
          success : true,
          message : "Password has been reset"
        })
    } catch (error) {
         console.error("Password reset error : " ,error);
          res.status(500).json({
              success : false,
              message : "Server error"
            })
        }
}
