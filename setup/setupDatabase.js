const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const { loadConfig } = require("./configLoader");


async function setupDatabase() {
    const config = loadConfig("db.config.json");
    const admin_config = loadConfig("createdb.config.json");

    const connection = await mysql.createConnection({
        host: admin_config.admin_host,
        user: admin_config.admin_user,
        password: admin_config.admin_password,
        multipleStatements: true
    });

    const dbName = config.database;
    const user = config.user;
    const pass = config.password;

    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`Database '${dbName}' created exists.`);

        await connection.query(`CREATE USER IF NOT EXISTS '${user}'@'localhost' IDENTIFIED BY '${pass}'`);

        await connection.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${user}'@'localhost'`);
        await connection.query(`FLUSH PRIVILEGES`);

        await connection.changeUser({ database: dbName });

        const schemaPath = path.join(__dirname, "sql", "schema.sql");
        if (!fs.existsSync(schemaPath)) {
            console.error(`SQL file not found: ${schemaPath}`);
            process.exit(1);
        }
        const schemaSQL = fs.readFileSync(schemaPath, "utf-8");
        await connection.query(schemaSQL);
        console.log("Database schema initialized ✅");


        const procsPath = path.join(__dirname, "sql", "script.sql");
        if (!fs.existsSync(procsPath)) {
            console.error(`SQL file not found: ${procsPath}`);
            process.exit(1);
        }
        const procsSQL = fs.readFileSync(procsPath, "utf-8");
        await connection.query(procsSQL);
        console.log("Scripts initialized ✅");


        console.log("Setup complete ✅");

    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

module.exports = {
    setupDatabase
};