const mysql = require("mysql2/promise");
const config = require("../../config/db.config.json");

const pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = {
    query: (sql, params) => pool.execute(sql, params),

    getConnection: _ =>{
        return pool.getConnection();
    },
    transaction: async (callback) => {
        const conn = await pool.getConnection();
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
