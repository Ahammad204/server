const express = require('express');
const TelegramBot = require("node-telegram-bot-api");
const { google } = require("googleapis");
// const moment = require("moment");
const moment = require("moment-timezone");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

// Port
const port = process.env.PORT || 5000;

// For knowing that server is working or not
app.get("/", (req, res) => {
  res.send("Server is Running....");
});

// For knowing which port we are using
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Telegram Bot and Google Sheets setup
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_DOCUMENT_ID;

const auth = new google.auth.JWT(SERVICE_ACCOUNT_EMAIL, null, PRIVATE_KEY, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

const sheets = google.sheets({ version: "v4", auth });

// Function for getting sheet data
async function getSheetData(range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
    });
    return response.data.values;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    throw error;
  }
}

// Function for adding a new row to the 'Form' sheet
async function addFormRow(rowData) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Form!A:D",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [rowData],
      },
    });
  } catch (error) {
    console.error("Error adding row:", error);
    throw error;
  }
}

// User state
const STATE = {
  NAME: "NAME",
  EMAIL: "EMAIL",
  PRAYER_STATUS: "PRAYER_STATUS",
};
let userState = {};

// Command to get the leaderboard
bot.onText(/\/leaderboard/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const rows = await getSheetData("Leaderboard!A:B");
    if (!rows || rows.length === 0) {
      bot.sendMessage(chatId, "No data available in the leaderboard.");
      return;
    }

    let leaderboardMessage = "Leaderboard:\n";
    // Sort rows by points
    rows.sort((a, b) => parseInt(b[1]) - parseInt(a[1]));

    rows.forEach((row) => {
      leaderboardMessage += `${row[0]}: ${row[1]} points\n`;
    });

    bot.sendMessage(chatId, leaderboardMessage);
  } catch (error) {
    bot.sendMessage(chatId, "Failed to retrieve the leaderboard.");
    console.error("Error fetching leaderboard data:", error);
  }
});

// Command to handle form submission between 5:00 AM and 6:00 AM
bot.onText(/\/form/, (msg) => {
  const chatId = msg.chat.id;
  const now = moment().tz("Asia/Dhaka");
  const startTime = moment.tz("16:00:00", "HH:mm:ss", "Asia/Dhaka");
  const endTime = moment.tz("18:00:00", "HH:mm:ss", "Asia/Dhaka");


  if (now.isBetween(startTime, endTime)) {
    bot.sendMessage(chatId, "Good Morning! Please enter your name:");
    userState[chatId] = { state: STATE.NAME };
  } else {
    bot.sendMessage(
      chatId,
      "Sorry, you are out of time. Please submit your form tomorrow."
    );
  }
});

// Handling input
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const currentState = userState[chatId]?.state;

  if (currentState === STATE.NAME) {
    userState[chatId].name = msg.text;
    userState[chatId].state = STATE.EMAIL;
    bot.sendMessage(chatId, "Please enter your email:");
  } else if (currentState === STATE.EMAIL) {
    userState[chatId].email = msg.text;
    userState[chatId].state = STATE.PRAYER_STATUS;
    bot.sendMessage(chatId, "Did you complete your prayer? (Yes/No)");
  } else if (currentState === STATE.PRAYER_STATUS) {
    const email = userState[chatId].email;
    const name = userState[chatId].name;
    const prayerStatus = msg.text;
    const today = moment().format("YYYY-MM-DD");

    try {
      // Check if user already submitted today
      const rows = await getSheetData("Form!A:D");
      const alreadySubmitted = rows.some((row) => {
        const submissionDate = moment(row[0], "YYYY-MM-DD").format(
          "YYYY-MM-DD"
        );
        return submissionDate === today && row[1] === email;
      });

      if (alreadySubmitted) {
        bot.sendMessage(
          chatId,
          "You have already submitted the form today. Please try again tomorrow."
        );
      } else {
        // Save submission data to Google Sheets
        await addFormRow([
          moment().format("YYYY-MM-DD HH:mm:ss"),
          email,
          name,
          prayerStatus,
        ]);
        bot.sendMessage(chatId, "Thank you for your submission!");
      }
    } catch (error) {
      bot.sendMessage(chatId, "Error saving your submission.");
      console.error("Error saving submission data:", error);
    }

    delete userState[chatId]; // Clear state after submission
  }
});

// Welcome message with available commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const commands = `
/form - Get the form (available between 5 AM and 6 AM)
/leaderboard - View the current leaderboard
/start - Welcome message and available commands
    `;
  const welcomeMessage = `Welcome to the Rise and Shine Challenge!\n\nAvailable commands:\n${commands}`;
  bot.sendMessage(chatId, welcomeMessage);
});
