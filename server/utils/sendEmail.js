// import nodemailer from 'nodemailer';
// import sendEmail from '../config/nodemailer.js';

// //send email for otp for updating password

// const sendEmail= async(data)=>{
//     try{

//         if(!data.email) throw new Error("Recipient email is missing"); // ✅ check

//         const transport = nodemailer.createTransport({
//             service:'Gmail',
//             auth:{
//                 user:'raghvendrapratapsingh505@gmail.com',
//                 pass:process.env.APP_PASSWORD
//             }
//         })

// const stringOtp = data.otp ? data.otp.toString() : '';

//         const mailOption = {
//             from : 'raghvendrapratapsingh505@gmail.com',
//             to:data.email,
//             subject:'password otp',
//             text:stringOtp,
//         }

//         const result = await transport.sendMail(mailOption);
//         return result;
//     }catch(error){
       
//         console.log(error);
//         return { status: false, message: error.message }; // optional: return error
//     }
// }

// export default sendEmail;


// //Function to send Reminder when a new connection request is added

// const sendNewConnectionRequestReminder = inngest.createFunction(
//     {id:"send-new-connection-request-reminder"},
//     {event:app/connection-request},

//     async({event,step}) =>{
//         const {connectionId} = event.data;

//         await step.run('send-connection-request-mail',async()=>{
//             const connection = await Connection.findByid(connectionId).populate('from_user_id to_user_id)');
//             const subject= `👋 New Connection Request`;
//             const  body = `
//             <div style="font-family: Arial,sans-serif; padding: 20px;">
//                 <h2>Hi ${connection.to_user_id.full_name},</h2>
//                 <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
//                 <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981;">here<a/> to accept or reject the request</p?
//                 <br/>
                
//                 <p?Thanks ,<bt/>PingUp - Stay Connected
                
//                 </div>`;

//                 await sendEmail({
//                     to:connection.to_user_id.email,
//                     subject,
//                     body
//                 })
//         })
//     }
// )



import nodemailer from 'nodemailer';
import sendEmail from '../config/nodemailer.js';

import Connection from '../models/Connection.js';
import dotenv from 'dotenv'
dotenv.config();


// ======================================
// ✅ Function to send OTP Email
// ======================================
export const sendOtpEmail = async (data) => {
    try {
        if (!data.email) throw new Error("Recipient email is missing");

        const transport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'raghvendrapratapsingh505@gmail.com',
                pass: process.env.APP_PASSWORD
            }
        });

        const stringOtp = data.otp ? data.otp.toString() : '';

        const mailOption = {
            from: 'raghvendrapratapsingh505@gmail.com',
            to: data.email,
            subject: 'Password OTP',
            text: stringOtp,
        };

        const result = await transport.sendMail(mailOption);
        return result;
    } catch (error) {
        console.log("OTP Email Error:", error.message);
        return { status: false, message: error.message };
    }
};

// ======================================
// ✅ Function to send New Connection Request + Reminder
// ======================================
export const sendConnectionRequestReminder = async (connectionId) => {
    try {
        // Step 1: Find connection
        const connection = await Connection.findById(connectionId).populate("from_user_id to_user_id");
        if (!connection) throw new Error("Connection not found");

        // Step 2: Send initial connection request email
        const subject = `👋 New Connection Request`;
        const body = `
            <div style="font-family: Arial,sans-serif; padding: 20px;">
                <h2>Hi ${connection.to_user_id.full_name},</h2>
                <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
                <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981;">here</a> to accept or reject the request</p>
                <br/>
                <p>Thanks,<br/>PingUp - Stay Connected</p>
            </div>
        `;

        await sendEmail({
            to: connection.to_user_id.email,
            subject,
            body
        });

        console.log("✅ Initial connection request email sent");

        // Step 3: Wait 24 hours then check again
        setTimeout(async () => {
            try {
                const updatedConnection = await Connection.findById(connectionId).populate("from_user_id to_user_id");
                if (!updatedConnection) return;

                if (updatedConnection.status === "accepted") {
                    console.log("✅ Connection already accepted. No reminder needed.");
                    return;
                }

                // Step 4: Send reminder email
                const reminderSubject = `👋 Reminder: Connection Request Pending`;
                const reminderBody = `
                    <div style="font-family: Arial,sans-serif; padding: 20px;">
                        <h2>Hi ${updatedConnection.to_user_id.full_name},</h2>
                        <p>You still have a pending connection request from ${updatedConnection.from_user_id.full_name} - @${updatedConnection.from_user_id.username}</p>
                        <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981;">here</a> to accept or reject the request</p>
                        <br/>
                        <p>Thanks,<br/>PingUp - Stay Connected</p>
                    </div>
                `;

                await sendEmail({
                    to: updatedConnection.to_user_id.email,
                    subject: reminderSubject,
                    body: reminderBody
                });

                console.log("✅ Reminder email sent");
            } catch (error) {
                console.error("❌ Error sending reminder:", error.message);
            }
        }, 24 * 60 * 60 * 1000); // 24 hours

    } catch (error) {
        console.error("❌ Error in sendConnectionRequestReminder:", error.message);
    }
};
