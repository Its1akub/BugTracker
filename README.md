# README – BugTracker Discord Bot

## 1️⃣ Vytvoření Discord Bota

1. Otevři **Discord Developer Portal** https://discord.com/developers/applications
2. Klikni **New Application**
3. Zadej název aplikace
4. V levém menu otevři **Bot**
5. Klikni **Add Bot**

### 🔑 Bot Token

* V sekci **Bot** klikni na **Reset Token** / **Copy Token**
* Token si **ulož**, bude potřeba do `discord.config.json`

> ⚠️ Token NIKDY nesdílej

---

## 2️⃣ Získání potřebných ID

### 🆔 Client ID (Bot ID)

* Developer Portal → **General Information**
* Zkopíruj **Application ID**

### 🆔 Server ID (Guild ID)

* V discordu si vytvoř discord server 

* a pak nasleduj tento postup
  * Discord → **User Settings → Advanced**
  * Zapni **Developer Mode**
  * Pravým klikem na server → **Copy Server ID**

---

## 3️⃣ Přidání bota na server

1. Developer Portal → **OAuth2 → URL Generator**
2. Scopes:

    * `bot`
    * `applications.commands`
3. Bot Permissions:

    * Send Messages
    * Read Message History
    * Use Slash Commands
4. Otevři vygenerovaný URL odkaz

---

## 4️⃣ Konfigurace projektu
>Uprav potřebné hodnoty
### 📄 `discord.config.json`

```json
{
  "token": "DISCORD_BOT_TOKEN",
  "clientId": "BOT_ID",
  "guildId": "SERVER_ID"
}
```
### 📄 `createdb.config.json`
```json
{
"admin_host": "localhost",
"admin_user": "root",
"admin_password": "heslo"
}
```

---

## 6️⃣ Spuštění projektu 

```bash
npm install
node setup/SetupScript.js
node app.js
```

---

## 7️⃣ Build do `.exe`

Používá se **pkg**.

### Instalace:

```bash
npm install -g pkg
```

### Build setup.exe

```bash
npm run build:setup
```

### Build app.exe

```bash
npm run build:app
```

---

## 8️⃣ Výsledné soubory

* `setup.exe` – inicializace databáze a discord příkazů
* `app.exe` – samotný Discord bot

---

## 9️⃣ Ovládání bota

Příkazy:

* `/project create` → vytvoření projektu
* `/project list` → vypsání projektů
* `/project activate` → aktivování projektu
* `/project deactivate` → deaktivování projektu
* `/project delete` → smazání projektu


* `/bhelp` → vypsaní prříkazů do chatu
* `/bug create` → vytvoření bugu
* `/bug list` → vypsání všech bugů
* `/bug comment` → připsání komentáře k danému bugu
* `/bug close` → uzavření bugu
* `/bug assign` → přiřazení bugu
* `/bug delete` → smazání bugu
* `/bug history` → vypsání všech operací co se dělo u bugů
* `/bug open` → otevření bugu


* `/import` → importování bugů pomocí .json souborů
  
struktura .json souboru je nasledující:  
```json
{
  "projects": [
    {
      "name": "Discord Bot",
      "is_active": true,
      "bugs": [
        {
          "title": "Slash command nefunguje",
          "priority": "HIGH"
        },
        {
          "title": "Chyba v databázi",
          "priority": "MEDIUM"
        }
      ]
    }
  ]
}
```



(Příkazy se zobrazí automaticky v Discordu)

---

## 🔟 Požadavky

* Windows 10+
* MySQL 
* Přístup k Discord serveru
* Node.js


