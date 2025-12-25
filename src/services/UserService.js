const UserRepository = require("../repositories/UserRepository");

class UserService {
    constructor() {
        this.repo = new UserRepository();
    }

    async getOrCreate(discordUser) {
        const user = await this.repo.findByDiscordId(discordUser.id);
        if (user === null) {
            return await this.repo.create(
                discordUser.id,
                discordUser.username
            );
        }
        return user.user_id;
    }
}

module.exports = UserService;
