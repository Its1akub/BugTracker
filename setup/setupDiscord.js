const { registerCommands } = require("./registerCommands");

async function setupDiscord() {
    await registerCommands();
}

module.exports = {
    setupDiscord
};
