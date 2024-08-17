# Discord Twitch Bot

A Node.js-based Discord bot for real-time Twitch streams, used by the GTA Latam Speedrun community.

## Features

- Sends a message to Discord when a Twitch stream goes live.
- Updates the message in real-time if the stream's information changes (e.g., title or status).
- Deletes the message from the Discord channel when the stream stops.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/discord-twitch-bot.git
    cd discord-twitch-bot
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up your environment:
    - Create a `config.json` file in the root directory with the following content:
      ```json
      {
        "discordToken": "YOUR_DISCORD_BOT_TOKEN",
        "discordClientId": "YOUR_DISCORD_CLIENT_ID",
        "discordGuild": "YOUR_DISCORD_GUILD_ID",
        "twitchClientId": "YOUR_TWITCH_CLIENT_ID",
        "twitchSecret": "YOUR_TWITCH_SECRET"
      }
      ```
    - Replace the placeholder values with your actual credentials:
      - `discordToken`: Your Discord bot token.
      - `discordClientId`: Your Discord client ID.
      - `discordGuild`: The ID of your Discord server (guild).
      - `twitchClientId`: Your Twitch client ID.
      - `twitchSecret`: Your Twitch client secret.

## Usage

To run the bot in development mode:

```bash
npm run dev
```

This will start the bot using `nodemon`, which automatically restarts the bot when code changes are detected.

## Project Structure

The bot is organized as follows:

- **commands/**: Contains the commands available for the bot, organized by categories.
- **events/**: Contains the event handlers for Discord events like `messageCreate` and `ready`.
- **index.js**: The main entry point for the bot.

## Real-Time Stream Notifications

- **New Stream**: When a Twitch stream goes live, the bot sends a message to the specified Discord channel.
- **Stream Information Update**: If the stream's information changes (e.g., title, status), the bot updates the existing message in real-time.
- **Stream End**: When the stream stops, the bot deletes the message from the Discord channel to indicate that the stream has ended.

## Dependencies

- [axios](https://www.npmjs.com/package/axios): For making HTTP requests.
- [better-sqlite3](https://www.npmjs.com/package/better-sqlite3): For efficient SQLite database handling.
- [discord.js](https://www.npmjs.com/package/discord.js): A powerful library for interacting with the Discord API.
- [is-image-header](https://www.npmjs.com/package/is-image-header): Utility to check if a file is an image based on its header.
- [moment](https://www.npmjs.com/package/moment): For date and time manipulation.
- [quick.db](https://www.npmjs.com/package/quick.db): A simple SQLite-based database solution.

## License

This project is licensed under the GPL-3.0-only License.

## Author

Created by [ferecece](https://github.com/ferecece).