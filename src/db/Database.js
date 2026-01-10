const mysql = require("mysql2/promise");

const {loadConfig} = require("../../setup/ConfigLoader");

const config = loadConfig("db.config.json");

const pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = {
    query: (sql, params) => pool.execute(sql, params),

    transaction: async (callback) => {

        /** @type {import('mysql2/promise').PoolConnection} */
        const conn = pool.getConnection();
        try {
            await conn.beginTransaction();
            const result = await callback(conn);
            await conn.commit();
            return result;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }
};
