const db = require("../db/Database");

class ProjectRepository {
    create(name,created_by) {
        return db.query(
            "INSERT INTO projects(name,created_by,is_active) VALUES (?,?,1)",
            [name,created_by]
        );
    }

    async list(discord_id) {
        return db.query(
            `SELECT
                 up.*,
                 u.discord_id AS autor_discord_id
             FROM user_projects up
                      LEFT JOIN users u ON u.user_id = up.created_by
             WHERE up.created_by = (SELECT user_id FROM users WHERE discord_id = ?)
                OR up.project_id IN (
                 SELECT b.project_id
                 FROM bugs b
                          JOIN bug_assignments ba ON b.bug_id = ba.bug_id
                 WHERE ba.user_id = (SELECT user_id FROM users WHERE discord_id = ?)
             )
             ORDER BY up.project_id;

            `,
            [discord_id, discord_id]
        );

    }
    findById(project_id) {
        return db.query("SELECT * FROM projects WHERE project_id = ?", [project_id]);
    }

    deactivate(project_id) {
        return db.query("UPDATE projects SET is_active=0 WHERE project_id = ?", [project_id]);
    }

    activate(project_id) {
        return db.query("UPDATE projects SET is_active=1 WHERE project_id = ?", [project_id]);
    }

    delete(project_id) {
        return db.query("DELETE FROM projects WHERE project_id = ?", [project_id]);
    }
    getName(project_id) {
        return db.query("SELECT name FROM projects where project_id = ?", [project_id]);
    }
}

module.exports = ProjectRepository;
