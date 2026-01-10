const db = require("../db/Database");

class BugRepository {

    async create(title, project_id, user_id, priority, estimated_time) {

        await db.transaction(async (conn) => {
            const [rows] = await conn.query(
                `SELECT 1
                 FROM projects p
                          LEFT JOIN bugs b ON b.project_id = p.project_id
                          LEFT JOIN bug_assignments ba ON ba.bug_id = b.bug_id
                 WHERE p.project_id = ?
                   AND (p.created_by = ? OR ba.user_id = ?)
                     LIMIT 1`,
                [project_id, user_id, user_id]
            );

            if (rows.length === 0) {
                throw new Error("Nemáte oprávnění přidat bug do tohoto projektu.");
            }

            const [bugResult] = await conn.query(
                `INSERT INTO bugs (title, project_id, priority, estimated_time,created_by)
                 VALUES (?, ?, ?, ?, ?)`,
                [title, project_id, priority, estimated_time, user_id]
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
        return db.query(`SELECT bug_id, bug_title, priority, status, project_name, created_at, u.discord_id as author_discord_id
            FROM user_assigned_bugs ua 
            left join users u on u.user_id = ua.created_by
            where ua.discord_id = ?`
            , [discord_id]);
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

    findById(bug_id) {
        return db.query("SELECT * FROM bugs WHERE bug_id = ?", [bug_id]);
    }

    getCommentsForBugs(bugIds) {
        if (bugIds.length === 0) {
            return [[], null];
        }

        const placeholders = bugIds.map(() => "?").join(",");

        return db.query(
            `SELECT author,content,created_at, bug_id FROM bug_comments_view
             WHERE bug_id in (${placeholders}) order by created_at ASC`, bugIds
        );
    }
    create_comment(bug_id,content,user_id) {
        return db.query("INSERT INTO bug_comments(bug_id,user_id,content) VALUES (?,?,?)",
            [bug_id,user_id,content]);
    }

    getName(bug_id) {
        return db.query("SELECT title FROM bugs where bug_id = ?", [bug_id]);
    }
    addHistory(bug_id, action, user_id) {
         db.query(
            `INSERT INTO bugs_history (bug_id, action, user_id)
                 VALUES (?, ?, ?)`,
            [bug_id, action, user_id]
        );
    }

    async assignBug(bug_id, user_id, assign_user_id) {
        try {
            const [result] = await db.query("CALL assign_bug_to_user(?, ?, ?)",
                [bug_id, user_id, assign_user_id])
            return result;
        }catch (err){
            console.error("FULL MySQL error:", err);
            throw new Error(err.sqlMessage || "Chyba při přiřazení bugu");
        }
    }

}

module.exports = BugRepository;
