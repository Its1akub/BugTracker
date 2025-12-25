const db = require("../db/Database");

class UserRepository {
    async findByDiscordId(discordId) {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE discord_id = ?",
            [discordId]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    async create(discordId, username) {
        const [res] = await db.query(
            "INSERT INTO users(discord_id, username) VALUES (?, ?)",
            [discordId, username]
        );
        return res.insertId;
    }
}

module.exports = UserRepository;
