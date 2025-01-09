require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const app = express();

// Middleware
app.use(bodyParser.json());

// Restrict CORS to your frontend's domain
const corsOptions = {
  origin: "*", // Replace with your frontend's domain for stricter security
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Load environment variables
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Ensure Paystack secret key is set
if (!PAYSTACK_SECRET_KEY) {
  console.error("PAYSTACK_SECRET_KEY is not set in the environment variables.");
  process.exit(1); // Exit process if the secret key is missing
}

// Root route for testing
app.get("/", (req, res) => {
  res.send("Paystack backend server is running and ready to handle requests.");
});

// Initialize a transaction
app.post("/initialize-transaction", async (req, res) => {
  const { email, amount } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ error: "Email and amount are required" });
  }

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      { email, amount },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error initializing transaction:", error.response?.data || error.message);
    return res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data || "Failed to initialize transaction" });
  }
});

// Verify a transaction
app.get("/verify-transaction/:reference", async (req, res) => {
  const { reference } = req.params;

  if (!reference) {
    return res.status(400).json({ error: "Transaction reference is required" });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error verifying transaction:", error.response?.data || error.message);
    return res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data || "Failed to verify transaction" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));