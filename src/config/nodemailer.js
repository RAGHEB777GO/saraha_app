
import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,   
  port: process.env.EMAIL_PORT,   
  secure: false,                  
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});


transporter.verify((err, success) => {
  if (err) {
    console.log("Nodemailer connection error:", err);
  } else {
    console.log("Nodemailer is ready to send emails");
  }
});

export default transporter;
