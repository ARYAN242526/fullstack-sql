import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, text) => {
    try {
      const transporter = nodemailer.createTransport({
          host: process.env.MAILTRAP_HOST,
          port: process.env.MAILTRAP_PORT,
          secure: false, 
          auth: {
            user: process.env.MAILTRAP_USERNAME,
            pass: process.env.MAILTRAP_PASSWORD,
          },
      });
  
      const mailOptions = {
        from: process.env.MAILTRAP_SENDEREMAIL,
        to,
        subject,
        text,
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.response}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };
  
  export default sendEmail;