const nodemailer=require('nodemailer');
const sendmail= async(options)=> 
{
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTPPORT,
    auth: {
      user: process.env.SMTP_EMAIL, 
      pass:process.env.SMTP_Password, 
    },
  });


  const message ={
    from: `${process.env.from_email} <${process.env.from_Name}>`,
    to:options.email,
    subject:options.subject,
    text:options.message,
  };

  const info=await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
}

module.exports=sendmail;
