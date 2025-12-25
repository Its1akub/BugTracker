const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const config = require("../../config/discord.config.json");

const commands = [
    new SlashCommandBuilder()
        .setName("bug")
        .setDescription("Bug commands")
        .addSubcommand(sub =>
            sub.setName("create")
                .setDescription("Vytvoří nový bug")
                .addStringOption(opt =>
                    opt.setName("title")
                        .setDescription("Název bugu")
                        .setRequired(true)
                ).addIntegerOption(opt =>
                    opt.setName("project_id")
                        .setDescription("Id projektu")
                        .setRequired(true)
                ).addStringOption(opt =>
                    opt.setName("priority")
                        .setDescription("LOW | MEDIUM | HIGH")
                ).addStringOption(opt =>
                opt.setName("estimated_time")
                    .setDescription("odhadovaný čas (float)")
                )
        )
        .addSubcommand(sub =>
            sub.setName("list")
                .setDescription("Seznam bugů")
        )
        .addSubcommand(sub =>
            sub.setName("history")
                .setDescription("historie operací")
        )
        .addSubcommand(sub =>
            sub.setName("comment")
                .setDescription("Přidá komentář k bugu")
                .addIntegerOption(opt =>
                    opt.setName("bug_id")
                        .setDescription("ID bugu")
                        .setRequired(true)
                    )
                .addStringOption(opt =>
                    opt.setName("content")
                        .setDescription("Text komentáře")
                        .setRequired(true)
                    )
        )
        .addSubcommand(sub =>
            sub.setName("close")
                .setDescription("Uzavře bug")
                .addIntegerOption(opt =>
                    opt.setName("bug_id")
                        .setDescription("ID bugu")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("open")
                .setDescription("Uzavře bug")
                .addIntegerOption(opt =>
                    opt.setName("bug_id")
                        .setDescription("ID bugu")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("delete")
                .setDescription("smaže bug")
                .addIntegerOption(opt =>
                    opt.setName("bug_id")
                        .setDescription("ID bugu")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("assign")
                .setDescription("Přiřadí bug uživateli")
                .addIntegerOption(opt =>
                    opt.setName("bug_id")
                        .setDescription("ID bugu")
                        .setRequired(true)
                )
                .addUserOption(opt =>
                    opt.setName("user")
                        .setDescription("Discord uživatel")
                        .setRequired(true)
                )
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName("project")
        .setDescription("Project commands")
        .addSubcommand(sub =>
            sub.setName("create")
                .setDescription("Vytvoří projekt")
                .addStringOption(opt =>
                    opt.setName("name")
                        .setDescription("Název")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("list")
                .setDescription("Seznam projektů")
        )
        .addSubcommand(sub =>
            sub.setName("deactivate")
                .setDescription("Deaktivuje projekt")
                .addIntegerOption(opt =>
                    opt.setName("project_id")
                        .setDescription("ID projektu")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("activate")
                .setDescription("Aktivuje projekt")
                .addIntegerOption(opt =>
                    opt.setName("project_id")
                        .setDescription("ID projektu")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("delete")
                .setDescription("Smaže projekt")
                .addIntegerOption(opt =>
                    opt.setName("project_id")
                        .setDescription("ID projektu")
                        .setRequired(true)
                )
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName("import")
        .setDescription("Import dat do databáze")
        .addAttachmentOption(opt =>
            opt.setName("file")
                .setDescription("JSON soubor")
                .setRequired(true)
        )
        .toJSON()
];

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
    try {
        console.log("Registering slash commands...");
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );
        console.log("Commands registered!");
    } catch (err) {
        console.error(err);
    }
})();
