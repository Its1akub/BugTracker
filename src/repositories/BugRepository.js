const db = require("../db/Database");

class BugRepository {

    async create(title, project_id, user_id, priority, estimated_time) {

        await db.transaction(async (conn) => {
            const [bugResult] = await conn.query(
                `INSERT INTO bugs (title, project_id, priority, estimated_time)
                 VALUES (?, ?, ?, ?)`,
                [title, project_id, priority, estimated_time]
            );
            const bugId = bugResult.insertId;
            await conn.query(
                `INSERT INTO bug_assignments (bug_id, user_id)
                 VALUES (?, ?)`,
                [bugId, user_id]
            );
            await conn.query(
                `INSERT INTO bugs_history (bug_id, action, user_id)
                 VALUES (?, 'CREATE', ?)`,
                [bugId, user_id]
            );
        });

    }


    list(discord_id) {
        return db.query("SELECT username, bug_id, bug_title, priority, status, project_name, created_at  FROM user_assigned_bugs where discord_id = ?", [discord_id]);
    }

    history(discord_id) {
        return db.query("SELECT bug_id, title, performed_by, action_date, action FROM bug_history_detail where discord_id = ?", [discord_id]);
    }

    close(bug_id) {
        return db.query("UPDATE bugs SET status='CLOSED' WHERE bug_id=?", [bug_id]);
    }
    open(bug_id) {
        return db.query("UPDATE bugs SET status='OPEN' WHERE bug_id=?", [bug_id]);
    }
    delete(bug_id) {
        return db.query("DELETE from bugs WHERE bug_id=?", [bug_id]);
    }

    create_comment(bug_id,content,user_id) {
        return db.query("INSERT INTO bug_comments(bug_id,user_id,content) VALUES (?,?,?,?,?,?,?)",
            [bug_id,user_id,content]);
    }

    getName(bug_id) {
        return db.query("SELECT title FROM bugs where bug_id = ?", [bug_id]);
    }

    assignBug(bug_id, user_id) {
        try {
            return db.query("CALL assign_bug_to_user(?, ?)",
                [bug_id, user_id])
        }catch (err){
            throw new Error(err.sqlMessage || "Chyba při přiřazení bugu");
        }
    }
}

module.exports = BugRepository;
