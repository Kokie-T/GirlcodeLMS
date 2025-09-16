const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configure your email transporter
// Make sure you use your **sender email** and its **App Password**
const transporter = nodemailer.createTransport({
  service: "gmail", // or another SMTP service
  auth: {
    user: "lmspro10@gmail.com",       // your sender Gmail
    pass: "czsj zazb cdum epkc",        // Gmail App Password (16-character)
  },
});

// Cloud Function triggered when a new user is created in Firestore
exports.sendWelcomeEmail = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    const user = snap.data();

    const mailOptions = {
      from: `"LMS Pro" <lmspro10@gmail.com>`, // display name + sender email
      to: user.email,                         // recipient's email
      subject: "Welcome to LMS Pro!",
      html: `
        <h2>Hello ${user.fullName},</h2>
        <p>Thank you for signing up for LMS Pro!</p>
        <p><strong>Your account email:</strong> ${user.email}</p>
        <p>Please verify your email before logging in.</p>
        <p>— The LMS Pro Team</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Welcome email sent to:", user.email);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  });
