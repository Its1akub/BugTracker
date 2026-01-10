const ProjectRepository = require("../repositories/ProjectRepository");

class ProjectService {
    constructor() {
        this.repo = new ProjectRepository();
    }

    create(name,created_by) {
        if (!name) throw new Error("Name required");
        return this.repo.create(name,created_by);
    }

    async _withProjectAction(project_id, callback) {
        if (!project_id) throw new Error("project_id required");

        const [rows] = await this.repo.findById(project_id);
        if (rows.length === 0) {
            throw new Error(`Project s ID ${project_id} neexistuje`);
        }

        return callback();
    }
    list(discord_id) {
        return this.repo.list(discord_id);
    }
    async deactivate(project_id, user_id) {
        const [rows] = await this.repo.findById(project_id);
        if (rows.length === 0) {
            throw new Error("Projekt neexistuje");
        }

        if (rows[0].created_by !== user_id) {
            throw new Error("Nemáš oprávnění deaktivovat tento projekt");
        }
        return this._withProjectAction(project_id, () => this.repo.deactivate(project_id));
    }
    async activate(project_id, user_id) {
        const [rows] = await this.repo.findById(project_id);
        if (rows.length === 0) {
            throw new Error("Projekt neexistuje");
        }

        if (rows[0].created_by !== user_id) {
            throw new Error("Nemáš oprávnění deaktivovat tento projekt");
        }
        return this._withProjectAction(project_id, () => this.repo.activate(project_id));
    }
    async delete(project_id, user_id) {
        const [rows] = await this.repo.findById(project_id);
        if (rows.length === 0) {
            throw new Error("Projekt neexistuje");
        }

        if (rows[0].created_by !== user_id) {
            throw new Error("Nemáš oprávnění deaktivovat tento projekt");
        }
        return this._withProjectAction(project_id, () => this.repo.delete(project_id));
    }
    async getName(project_id){
        if (!project_id) throw new Error("project_id required");
        const result = await this.repo.getName(project_id);
        return result[0][0].name;
    }

}

module.exports = ProjectService;
