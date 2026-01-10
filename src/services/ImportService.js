const ImportRepository = require("../repositories/ImportRepository");



class ImportService {
    constructor() {
        this.repo = new ImportRepository();
    }

    import(json, user_id) {
        return this.repo.importFromJson(json,user_id);
    }
}
module.exports = ImportService;