const BugRepository = require("../repositories/BugRepository");

class BugService {
    constructor() {
        this.repo = new BugRepository();
    }

    create(title,project_id,user_id,priority,estimated_time) {
        if (!title) throw new Error("Title required");
        return this.repo.create(title,project_id,user_id,priority,estimated_time);
    }

    list(discord_id) {
        return this.repo.list(discord_id);
    }
    history(discord_id) {
        return this.repo.history(discord_id);
    }

    close(bug_id) {
        if (!bug_id) throw new Error("bug_id required");
        return this.repo.close(bug_id);
    }
    open(bug_id) {
        if (!bug_id) throw new Error("bug_id required");
        return this.repo.open(bug_id);
    }
    delete(bug_id) {
        if (!bug_id) throw new Error("bug_id required");
        return this.repo.delete(bug_id);
    }
    create_comment(bug_id,content,user_id){
        if (!bug_id) throw new Error("bug_id required");
        return this.repo.create_comment(bug_id,content,user_id)
    }
    getName(bug_id){
        return this.repo.getName(bug_id);
    }
    assignBug(bug_id,user_id){
        if (!bug_id) throw new Error("bug_id required");
        if (!user_id) throw new Error("user_id required");
        return this.repo.assignBug(bug_id,user_id);
    }
}

module.exports = BugService;
