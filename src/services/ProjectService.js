const ProjectRepository = require("../repositories/ProjectRepository");
const db = require("../db/Database");

class ProjectService {
    constructor() {
        this.repo = new ProjectRepository();
    }

    create(name) {
        if (!name) throw new Error("Name required");
        return this.repo.create(name);
    }

    list(discord_id) {
        return this.repo.list(discord_id);
    }
    deactivate(project_id) {
        return this.repo.deactivate(project_id);
    }
    activate(project_id) {
        return this.repo.activate(project_id);
    }
    delete(project_id) {
        return this.repo.delete(project_id);
    }
    getName(project_id){
        return this.repo.getName(project_id);
    }
}

module.exports = ProjectService;
