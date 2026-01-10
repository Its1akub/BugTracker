const {setupDatabase} = require("./setupDatabase");
const {setupDiscord} = require("./setupDiscord");

(async () => {
    try {
        await setupDatabase();
        await setupDiscord();
        console.log("Application setup finished 🎉");
    } catch (err) {
        console.error("Startup failed:", err.message);
        process.exit(1);
    }
})();
