const { Client, GatewayIntentBits, Events, ActivityType } = require("discord.js");
const config = require("../../config/discord.config.json");
const BugService = require("../services/BugService");
const ProjectService = require("../services/ProjectService");
const UserService = require("../services/UserService");


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, () => {
    console.log("Bot ready!");
    client.user.setPresence({
        activities: [
            {
                name: "/bhelp",
                type: ActivityType.Playing
            }
        ],
        status: "online"
    });

});
async function handleError(interaction, error) {
    console.error("❌ ERROR:", error);

    let message = "❌ Nastala neočekávaná chyba.";

    if (error.sqlMessage) {
        message = `❌ ${error.sqlMessage}`;
    }

    if (error.message) {
        message = `❌ ${error.message}`;
    }

    if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: message, ephemeral: true });
    } else {
        await interaction.reply({ content: message, ephemeral: true });
    }
}


client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    try {
        const bugService = new BugService();
        const projectService = new ProjectService();
        const userService = new UserService();
        const userId = await userService.getOrCreate(interaction.user);
        const discordId = interaction.user.id;


        if (interaction.commandName === "bug") {
            const sub = interaction.options.getSubcommand();
            if (sub === "create") {
                const title = interaction.options.getString("title");
                const projectId = interaction.options.getInteger("project_id");
                const priority = interaction.options.getString("priority");
                const estimated_time = interaction.options.getString("estimated_time");
                await bugService.create(title, projectId, userId, priority, estimated_time);
                await interaction.reply(`Bug "${title}" vytvořen!`);
            }
            if (sub === "list") {
                const [rows] = await bugService.list(discordId);

                if (rows.length === 0) {
                    return interaction.reply("📭 Nemáš žádný bugy");
                }

                const text = rows.map(b =>
                    `🐞 **${b.bug_title}**
                        • 👤 Autor: ${b.username}
                        • #️⃣ ID: ${b.bug_id}
                        • ⚠️ Priorita: **${b.priority}**
                        • 📌 Stav: **${b.status}**
                        • 📁 Projekt: **${b.project_name}**
                        • 🕒 Vytvořeno: ${new Date(b.created_at).toLocaleString("cs-CZ")}`
                ).join("\n────────────\n");
                await interaction.reply("**Seznam bugů**\n" + text);
            }
            if (sub === "history") {
                const [rows] = await bugService.history(discordId);

                if (rows.length === 0) {
                    return interaction.reply("ℹ️ Zatím žádní histrie operací.");
                }
                const text = rows.map(h =>
                    `📝 **${h.action}**
                    • 🐞 Bug: **${h.title}** - #️⃣ id: ${h.bug_id}
                    • 👤 Provedl: ${h.performed_by}
                    • 🕒 ${new Date(h.action_date).toLocaleString("cs-CZ")}
                    `
                ).join("\n────────────\n");
                await interaction.reply("📜 **Historie operací**\n" + text);
            }
            if (sub === "close") {
                const id = interaction.options.getInteger("bug_id");
                await bugService.close(id);
                const name = await bugService.getName(id);
                await interaction.reply(`✔ Bug ${name} uzavřen`);
            }
            if (sub === "open") {
                const id = interaction.options.getInteger("bug_id");
                await bugService.open(id);
                const name = await bugService.getName(id);
                await interaction.reply(`✔ Bug ${name} otevřen`);
            }
            if (sub === "delete") {
                const id = interaction.options.getInteger("bug_id");
                const name = await bugService.getName(id);
                await bugService.delete(id);
                await interaction.reply(`✔ Bug ${name} smazán`);
            }
            if (sub === "comment") {
                const id = interaction.options.getInteger("bug_id");
                const content = interaction.options.getInteger("content");
                await bugService.create_comment(id,content,userId);
                await interaction.reply(`komentář přidán`);
            }
            if (sub === "assign") {
                const id = interaction.options.getInteger("bug_id");
                const user = interaction.options.getUser("user");
                const assignUserID = await userService.getOrCreate(user);
                await bugService.assignBug(id,assignUserID);
                await interaction.reply(`bug přiřazen`);
            }
        }

        if (interaction.commandName === "project") {
            const sub = interaction.options.getSubcommand();
            if (sub === "create") {
                const name = interaction.options.getString("name");
                await projectService.create(name);
                await interaction.reply(`📁 Projekt "${name}" vytvořen`);
            }
            if (sub === "list") {
                const [rows] = await projectService.list(discordId);
                if (rows.length === 0) {
                    return interaction.reply("📭 Nemáš žádný projekt.");
                }
                const text = rows.map(p => {
                    const active = p.is_active ? "🟢 Aktivní" : "🔴 Neaktivní";

                    return `📁 **${p.project_name}**
                            • #️⃣️ ID: ${p.project_id}
                            • 📊 Počet bugů: **${p.bug_count}**
                            • ⚙️ Stav: ${active}
                            • 🕒 První bug: ${p.first_bug_date
                                                ? new Date(p.first_bug_date).toLocaleString("cs-CZ")
                                                : "—"}
                            • 🕘 Poslední bug: ${p.last_bug_date
                                                ? new Date(p.last_bug_date).toLocaleString("cs-CZ")
                                                : "—"}
                            `;
                }).join("\n────────────\n");
                await interaction.reply("📂 **Seznam projektů**\n" + text);
            }
            if (sub === "deactivate") {
                const id = interaction.options.getInteger("project_id");
                await projectService.deactivate(id);
                const name = await projectService.getName(id);
                await interaction.reply(`✔ Projekt ${name} byl deaktivován`);
            }
            if (sub === "activate") {
                const id = interaction.options.getInteger("project_id");
                await projectService.activate(id);
                const name = await projectService.getName(id);
                await interaction.reply(`✔ Projekt ${name} byl aktivován`);
            }
            if (sub === "delete") {
                const id = interaction.options.getInteger("project_id");
                const name = await projectService.getName(id);
                await projectService.delete(id);
                await interaction.reply(`✔ Projekt ${name} smazán`);
            }
        }
    } catch (err) {
        await handleError(interaction, err);
    }
});

client.login(config.token);
