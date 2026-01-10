const fs = require("fs");
const path = require("path");

function loadConfig(name) {
    let configPath;

    if (process.env.CONFIG_PATH) {
        configPath = path.join(process.env.CONFIG_PATH, name);
    } else {
        const idePath = path.join(__dirname, "config", name);
        if (fs.existsSync(idePath)) {
            configPath = idePath;
        } else {
            configPath = path.join(process.cwd(), "config", name);
        }
    }

    if (!fs.existsSync(configPath)) {
        throw new Error(`Config file not found: ${configPath}`);
    }

    try {
        const raw = fs.readFileSync(configPath, "utf-8");
        return JSON.parse(raw);
    } catch (err) {
        throw new Error(`Invalid config file ${name}: ${err.message}`);
    }
}

module.exports = {
    loadConfig
};
