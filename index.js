const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config(); //config .env file
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' })); // Allow all origins or specify allowed origins

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI
  //  , { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("DB Success"))
  .catch((err) => console.error("DB failed:", err));

// Mongoose Schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});
 
// Model
const Contact = mongoose.model("Contact", contactSchema);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// POST Route to handle contact form submissions
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Save to MongoDB
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // Send Email
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_RECIPIENT,
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Failed to send email" });
      }
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Message sent successfully" });
    });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ message: "Failed to save message" });
  }
});

// Fallback route for unmatched routes
app.get("/", (req, res) => {
  res.send("This is an API server. Use the correct endpoints.");
});


// Start Server
app.listen(PORT, () =>
  console.log(`Server running at ${PORT}`)
);

