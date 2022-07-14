const dotenv = require('dotenv')

dotenv.config()

import { Interaction } from "discord.js"
const { Client, Intents } = require('discord.js')
const client = new Client({ intents: Object.keys(Intents.FLAGS) })

client.once("ready", async () => {
    const data = [{
        name: 'gate',
        description: 'チャンネルに入るためのゲートを作ります。管理者権限が必要です。'
    }]
    await client.application.commands.set(data, '844175560044445716')
    console.log('/==============/')
    console.log(client.user.tag)
    console.log('/==============/')
})

client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand()) {
        return
    }
    if (interaction.commandName === 'gate') {
        interaction.channel?.send({
            embeds: [{
                title: 'Fortnite',
                color: 0x2FA5E4,
                fields: [
                    {
                        name: 'Homepage',
                        value: 'https://fortnite.com'
                    },
                    {
                        name: 'Twitter',
                        value: 'https://twitter.com/FortniteJP'
                    }
                ],
                footer: {
                    text: 'Developer: Epic Games / Publisher: Epic Games'
                }
            }]
        })
        await interaction.reply({
            ephemeral: true,
            content: '正常に投稿されました。'
        })
    }
})

client.login(process.env.DISCORD_TOKEN)