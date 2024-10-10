

# Rise and Shine Challenge Telegram Bot

## Overview

The **Rise and Shine Challenge** is a Telegram bot designed to collect user submissions related to their morning prayers and maintain a leaderboard based on their participation. Users can submit their details within a specified time frame and view the leaderboard at any time.

## Features

- **Form Submission**: Users can submit their name, email, and prayer status (Yes/No) through the bot between 5:00 AM and 6:00 AM.
- **Leaderboard**: Users can view a leaderboard that ranks participants based on their points for submissions.
- **Persistent User State**: The bot tracks user state to facilitate a smooth submission process.

## Technologies Used

- **Node.js**: JavaScript runtime for building the server and bot.
- **Express**: Web framework for Node.js to create the server.
- **node-telegram-bot-api**: Library to interact with the Telegram Bot API.
- **Google Sheets API**: For storing and retrieving user submissions and leaderboard data.
- **Moment.js**: For handling date and time operations.

## Prerequisites

To run this project, you need:

- Node.js installed on your machine.
- A Telegram Bot Token (created using the BotFather on Telegram).
- Google Service Account credentials for accessing Google Sheets.

## Setup Instructions

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the root directory of the project and add the following variables:

   ```plaintext
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
   GOOGLE_PRIVATE_KEY="your_service_account_private_key"
   GOOGLE_SHEETS_DOCUMENT_ID=your_google_sheets_document_id
   ```

   - Replace `your_telegram_bot_token` with the token you received from BotFather.
   - Replace `your_service_account_email` with your Google Service Account email.
   - Replace `your_service_account_private_key` with your Google Service Account private key. Make sure to keep the quotes as shown.
   - Replace `your_google_sheets_document_id` with the ID of the Google Sheet you will be using.

4. **Run the server**:

   ```bash
   node index.js
   ```

   The server will start on the specified port (default is 5000). You should see a message in the console indicating that the server is running.

## Bot Commands

- **/start**: Welcome message and available commands.
- **/form**: Initiates the form submission process (available between 5:00 AM and 6:00 AM).
- **/leaderboard**: Displays the current leaderboard ranking participants by points.

## How It Works

1. **Server Setup**: The bot runs an Express server to listen for incoming messages.
2. **Telegram Bot Configuration**: The bot is initialized using the Telegram Bot Token.
3. **Google Sheets API Setup**: The bot uses a Google Service Account to authenticate and access the specified Google Sheet.
4. **Form Submission**: When users send the `/form` command within the time frame, the bot prompts them for their name, email, and prayer status.
5. **Data Storage**: Submissions are stored in the Google Sheet, and the bot checks if the user has already submitted on the same day.
6. **Leaderboard**: Users can access the leaderboard at any time, which displays the names and points of participants.

## Important Notes

- Ensure that your Google Sheet has the necessary permissions for the service account to read and write data.
- The bot only accepts submissions between 5:00 AM and 6:00 AM. If a user tries to submit outside this timeframe, they will receive a message indicating that submissions are closed.

## Developer

- **Kazi Ahammad Ullah**

## Contributing

If you want to contribute to this project, feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License.

