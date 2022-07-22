const dotenv = require('dotenv')

dotenv.config()

import * as fs from 'fs'

import { Interaction, MessageActionRow, MessageButton } from "discord.js"
const { Client, Intents } = require('discord.js')
const client = new Client({ intents: Object.keys(Intents.FLAGS) })

const gateEmbeds: Record<string, Record<string, string>> = {}
const gateRoles: Record<string, string> = {}

client.once("ready", async () => {
    const gateFiles = fs.readdirSync('./src/embeds').filter(file => file.startsWith('gate_') && (file.endsWith('.js') || file.endsWith('.ts')))
    for (const file of gateFiles) {
        const embed = await import(`./embeds/${file.split('.')[0]}`)
        gateEmbeds[file.split('.')[0]] = embed.gate
        gateRoles[file.split('.')[0]] = embed.role
    }

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
    if (interaction.isButton()) {
        switch (interaction.customId) {
            case 'btn_give':
                if (Array.isArray(interaction.member?.roles)) return
                interaction.member?.roles.add('998167806623350785')
                interaction.reply({
                    content: ':inbox_tray: 入室しました',
                    ephemeral: true
                })
                break
            case 'btn_take':
                if (Array.isArray(interaction.member?.roles)) return
                interaction.member?.roles.remove('998167806623350785')
                interaction.reply({
                    content: ':outbox_tray: 退出しました',
                    ephemeral: true
                })
                break
            default:
                interaction.reply({
                    content: 'エラーが発生しました',
                    ephemeral: true
                })
        }
    }
    if (!interaction.isCommand()) {
        return
    }
    if (interaction.commandName === 'gate') {
        const btn_give = new MessageButton()
            .setCustomId('btn_give')
            .setStyle('PRIMARY')
            .setEmoji('📥')
            .setLabel('入室')
        const btn_take = new MessageButton()
            .setCustomId('btn_take')
            .setStyle('SECONDARY')
            .setEmoji('📤')
            .setLabel('退出')
        interaction.channel?.send({
            embeds: [gateEmbeds.gate_debug],
            components: [
                new MessageActionRow().addComponents(btn_give).addComponents(btn_take)
            ]
        })
        await interaction.reply({
            ephemeral: true,
            content: '正常に投稿されました。'
        })
    }
})

client.login(process.env.DISCORD_TOKEN)