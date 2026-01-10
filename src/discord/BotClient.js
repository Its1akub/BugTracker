const { Client, GatewayIntentBits, Events, ActivityType, EmbedBuilder } = require("discord.js");

const BugService = require("../services/BugService");
const ProjectService = require("../services/ProjectService");
const UserService = require("../services/UserService");
const ImportService = require("../services/ImportService");

const {loadConfig} = require("../../setup/ConfigLoader");


const config = loadConfig("discord.config.json");

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
    //console.error("❌ ERROR:", error);

    let message = "❌ Nastala neočekávaná chyba.";

    if (error.sqlMessage) {
        message = `❌ ${error.sqlMessage}`;
    }

    if (error.message) {
        message = `❌ ${error.message}`;
    }

    if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: message, flags: 64 });
    } else {
        await interaction.reply({ content: message, flags: 64 });
    }
}


client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    try {
        const bugService = new BugService();
        const projectService = new ProjectService();
        const userService = new UserService();
        const importService = new ImportService();
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
                await interaction.reply({content:`Bug "${title}" vytvořen!`, flags: 64});
            }
            if (sub === "list") {
                const bugs = await bugService.listWithComments(discordId);

                if (bugs.length === 0) {
                    return interaction.reply({content:"📭 Nemáš žádný bugy", flags: 64});
                }

                const text = bugs.map(b => {

                    const comments = b.comments.length > 0
                        ? b.comments.map(c => `↳ 💬 **<@${c.author}>**: ${c.content}`).join("\n")
                        : "↳ 💬 Žádné komentáře";

                    return (`🐞 **${b.bug_title}**
                        • 👤 Autor: <@${b.author_discord_id}>
                        • #️⃣ ID: ${b.bug_id}
                        • ⚠️ Priorita: **${b.priority ?? "-"}**
                        • 📌 Stav: **${b.status}**
                        • 📁 Projekt: **${b.project_name}**
                        • 🕒 Vytvořeno: ${new Date(b.created_at).toLocaleString("cs-CZ")}
                        
🗨 **Komentáře:**
${comments}`);
                }).join("\n\n────────────\n\n");
                await interaction.reply("**Seznam bugů**\n\n" + text);
            }
            if (sub === "history") {
                const [rows] = await bugService.history(discordId);

                if (rows.length === 0) {
                    return interaction.reply({content:"ℹ️ Zatím žádní histrie operací.", flags: 64});
                }
                const text = rows.map(h =>
                    `📝 **${h.action}**
                    • 🐞 Bug: **${h.title}** - #️⃣ id: ${h.bug_id}
                    • 👤 Provedl: <@${discordId}>
                    • 🕒 ${new Date(h.action_date).toLocaleString("cs-CZ")}
                    `
                ).join("\n────────────\n");
                await interaction.reply({content:"📜 **Tvoje Historie operací**\n" +text, flags: 64});
            }
            if (sub === "close") {
                const id = interaction.options.getInteger("bug_id");
                await bugService.close(id,userId);
                const name = await bugService.getName(id);
                await interaction.reply({content:`✔ Bug ${name} uzavřen`, flags: 64});
            }
            if (sub === "open") {
                const id = interaction.options.getInteger("bug_id");
                await bugService.open(id,userId);
                const name = await bugService.getName(id);
                await interaction.reply({content:`✔ Bug ${name} otevřen`, flags: 64});
            }
            if (sub === "delete") {
                const id = interaction.options.getInteger("bug_id");
                const name = await bugService.getName(id);
                await bugService.delete(id, userId);
                await interaction.reply({content:`✔ Bug ${name} smazán`, flags: 64});
            }
            if (sub === "comment") {
                const id = interaction.options.getInteger("bug_id");
                const content = interaction.options.getString("content");
                await bugService.create_comment(id,content,userId);
                await interaction.reply({content:`komentář přidán`, flags: 64});
            }
            if (sub === "assign") {
                const id = interaction.options.getInteger("bug_id");
                const user = interaction.options.getUser("user");
                const assignUserID = await userService.getOrCreate(user);
                await bugService.assignBug(id, userId, assignUserID);
                await interaction.reply({content:`bug přiřazen`, flags: 64});
            }
        }

        if (interaction.commandName === "project") {
            const sub = interaction.options.getSubcommand();
            if (sub === "create") {
                const name = interaction.options.getString("name");
                await projectService.create(name,userId);
                await interaction.reply({content:`📁 Projekt "${name}" vytvořen`, flags: 64});
            }
            if (sub === "list") {
                const [rows] = await projectService.list(discordId);
                if (rows.length === 0) {
                    return interaction.reply("📭 Nemáš žádný projekt.");
                }
                const text = rows.map(p => {
                    const active = p.is_active ? "🟢 Aktivní" : "🔴 Neaktivní";

                    return `📁 **${p.project_name}**
                            • 👤 Vytvořen: <@${p.autor_discord_id}>
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
                await projectService.deactivate(id, userId);
                const name = await projectService.getName(id);
                await interaction.reply({content:`✔ Projekt ${name} byl deaktivován`,flags: 64});
            }
            if (sub === "activate") {
                const id = interaction.options.getInteger("project_id");
                await projectService.activate(id, userId);
                const name = await projectService.getName(id);
                await interaction.reply({content:`✔ Projekt ${name} byl aktivován`,flags: 64});
            }
            if (sub === "delete") {
                const id = interaction.options.getInteger("project_id");
                const name = await projectService.getName(id);
                await projectService.delete(id, userId);
                await interaction.reply({content: `✔ Projekt ${name} smazán`, flags: 64});
            }
        }
        if (interaction.commandName === "import") {
            const file = interaction.options.getAttachment("file");
            if (!file.name.endsWith(".json")) {
                return interaction.reply({
                    content: "❌ Soubor musí být .json",
                    flags: 64
                });
            }
            try {
                const response = await fetch(file.url);
                const json = await response.json();

                await importService.import(
                    json,
                    userId
                );

                await interaction.reply({content:"✅ Import proběhl úspěšně", flags: 64});
            } catch (err) {
                await interaction.reply({
                    content: `❌ Import selhal: ${err.message}`,
                    flags: 64
                });
            }
        }
        if (interaction.commandName === "bhelp") {
            const embed = new EmbedBuilder()
                .setTitle("📖 Bug Tracker – Nápověda")
                .setColor(0x00AAFF)
                .setDescription("Seznam dostupných příkazů a jejich popis:");


            embed.addFields(
                { name: "/bug create", value: "Vytvoří nový bug.\nParametry: `title`, `project_id`, `priority` (volitelné), `estimated_time` (volitelné)", inline: false },
                { name: "/bug list", value: "Vylistuje všechny bugu v systému.", inline: false },
                { name: "/bug history", value: "Ukáže historii operací na bugy.", inline: false },
                { name: "/bug comment", value: "Přidá komentář k bugu.\nParametry: `bug_id`, `content`", inline: false },
                { name: "/bug close", value: "Uzavře bug.\nParametry: `bug_id`", inline: false },
                { name: "/bug open", value: "Otevře bug.\nParametry: `bug_id`", inline: false },
                { name: "/bug delete", value: "Smaže bug.\nParametry: `bug_id`", inline: false },
                { name: "/bug assign", value: "Přiřadí bug uživateli.\nParametry: `bug_id`, `user` (Discord uživatel)", inline: false },

                { name: "/project create", value: "Vytvoří nový projekt.\nParametry: `name`", inline: false },
                { name: "/project list", value: "Vylistuje všechny projekty.", inline: false },
                { name: "/project deactivate", value: "Deaktivuje projekt.\nParametry: `project_id`", inline: false },
                { name: "/project activate", value: "Aktivuje projekt.\nParametry: `project_id`", inline: false },
                { name: "/project delete", value: "Smaže projekt.\nParametry: `project_id`", inline: false },

                { name: "/import", value: "Importuje data do databáze.\nParametry: `file` (JSON soubor)", inline: false }
            );

            await interaction.reply({ embeds: [embed], flags: 64 });
        }
    } catch (err) {
        await handleError(interaction, err);
    }
});

client.login(config.token);
