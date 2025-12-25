const db = require("../db/Database");

class ProjectRepository {
    create(name) {
        return db.query(
            "INSERT INTO projects(name,is_active) VALUES (?,1)",
            [name]
        );
    }

    list(discord_id) {
        return db.query("SELECT project_id, project_name, is_active, bug_count, first_bug_date, last_bug_date FROM user_projects where discord_id = ?", [discord_id]);
    }
    deactivate(id) {
        return db.query("UPDATE projects SET is_active=0 WHERE id = ?", id);
    }

    activate(id) {
        return db.query("UPDATE projects SET is_active=1 WHERE id = ?", id);
    }

    delete(id) {
        return db.query("DELETE FROM projects WHERE id = ?", id);
    }
    getName(project_id) {
        return db.query("SELECT name FROM projekts where id = ?", project_id);
    }
}

module.exports = ProjectRepository;
