const dotenv = require('dotenv')

dotenv.config()

const { Client, Intents } = require('discord.js')
const client = new Client({ intents: Object.keys(Intents.FLAGS) })

client.once("ready", async () => {
    console.log('/==============/')
    console.log(client.user.tag)
    console.log('/==============/')
})

client.login(process.env.DISCORD_TOKEN)