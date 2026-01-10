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

    async _withBugAction(bug_id, user_id, action, callback) {
        if (!bug_id) throw new Error("bug_id required");

        const [rows] = await this.repo.findById(bug_id);
        if (rows.length === 0) {
            throw new Error(`Bug s ID ${bug_id} neexistuje`);
        }

        if (rows[0].created_by !== user_id && action !== 'COMMENT') {
            throw new Error(`Nemáš oprávnění ${action} na tento bug`);
        }

        await this.repo.addHistory(bug_id, action, user_id);

        return callback();
    }


    async listWithComments(discordId) {

        const [bugs] = await this.repo.list(discordId);

        if (bugs.length === 0) {
            return [];
        }

        const bugIds = bugs.map(b => b.bug_id);
        const [comments] = await this.repo.getCommentsForBugs(bugIds);

        const commentsMap = {};
        for (const c of comments) {
            if (!commentsMap[c.bug_id]) {
                commentsMap[c.bug_id] = [];
            }
            commentsMap[c.bug_id].push(c);
        }

        return bugs.map(bug => ({
            ...bug,
            comments: commentsMap[bug.bug_id] || []
        }));
    }

    history(discord_id) {
        return this.repo.history(discord_id);
    }

    async close(bug_id, user_id) {
        return this._withBugAction(bug_id, user_id, 'CLOSE', () => this.repo.close(bug_id));
    }
    open(bug_id, user_id) {
        return this._withBugAction(bug_id, user_id, 'OPENED', () => this.repo.open(bug_id));
    }
    delete(bug_id, user_id) {
        return this._withBugAction(bug_id, user_id, 'DELETE', () => this.repo.delete(bug_id));
    }
    create_comment(bug_id,content,user_id){
        return this._withBugAction(bug_id, user_id, 'COMMENT', () => this.repo.create_comment(bug_id, content, user_id));
    }
    async getName(bug_id){
        if (!bug_id) throw new Error("bug_id required");
        const result = await this.repo.getName(bug_id);
        return result[0][0].title;
    }
    assignBug(bug_id,user_id, assign_user_id){
        if (!bug_id) throw new Error("bug_id required");
        if (!assign_user_id) throw new Error("user_id required");
        return this.repo.assignBug(bug_id,user_id,assign_user_id);
    }
}

module.exports = BugService;
