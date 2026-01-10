const db = require("../db/Database");

class ImportRepository {

    async importFromJson(json, user_id) {
        console.log("📥 Import started");

        try {
            await db.transaction(async (conn) => {

                for (const project of json.projects) {
                    console.log("📁 Project:", project.name);

                    const [projectRes] = await conn.query(
                        `INSERT INTO projects (name, is_active)
                     VALUES (?, ?)`,
                        [project.name, project.is_active ?? 1]
                    );

                    const projectId = projectRes.insertId;

                    for (const bug of project.bugs) {
                        console.log("🐞 Bug:", bug.title);

                        const [bugRes] = await conn.query(
                            `INSERT INTO bugs (title, priority, status, project_id)
                         VALUES (?, ?, 'OPEN', ?)`,
                            [bug.title, bug.priority, projectId]
                        );

                        const bugId = bugRes.insertId;

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
                    }
                }
            });

            console.log("✅ Import finished");

        } catch (err) {
            console.error("❌ Import failed:", err);
            throw err;
        }
    }

}

module.exports = ImportRepository;