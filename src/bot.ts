const dotenv = require('dotenv')

dotenv.config()

import * as fs from 'fs'

import { Interaction, MessageActionRow, MessageButton } from "discord.js"
const { Client, Intents } = require('discord.js')

import { db_gate } from './db'

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

    const gates: Record<string, string>[] = []
    for (const gateName in gateRoles) {
        gates.push({
            name: gateName,
            value: gateName
        })
    }

    const data = [{
        name: 'gate',
        description: 'チャンネルに入るためのゲートを作ります。管理者権限が必要です。',
        options: [
            {
                type: 'STRING',
                name: 'ゲート名',
                description: '作成されるゲートを指定します',
                required: true,
                choices: gates
            }
        ]
    }]
    await client.application.commands.set(data, '844175560044445716')

    console.log('/==============/')
    console.log(client.user.tag)
    console.log('/==============/')
})

client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isButton()) {
        if (Array.isArray(interaction.member?.roles)) return
        for (const i in gateRoles) {
            if (`btn_${i}_give` === interaction.customId) {
                await interaction.member?.roles.add(gateRoles[i])
                await interaction.reply({
                    content: ':inbox_tray: 入室しました',
                    ephemeral: true
                })
                return
            }
            if (`btn_${i}_take` === interaction.customId) {
                await interaction.member?.roles.remove(gateRoles[i])
                await interaction.reply({
                    content: ':outbox_tray: 退出しました',
                    ephemeral: true
                })
                return
            }
        }
        await interaction.reply({
            content: 'エラーが発生しました',
            ephemeral: true
        })
        return
    }
    if (!interaction.isCommand()) {
        return
    }
    if (interaction.commandName === 'gate') {
        const gateName = interaction.options.getString('ゲート名')
        if (!gateName) return
        if (!(gateName in gateRoles)) {
            await interaction.reply({
                ephemeral: true,
                content: 'エラー: 無効なゲート名です'
            })
            return
        }

        if (await db_gate.has(gateName)) {
            const a = await db_gate.get(gateName);
            const gateChannel = await interaction.guild?.channels.fetch(a.channel)
            if (!gateChannel?.isText()) {
                interaction.reply({
                    ephemeral: true,
                    content: 'エラー: 無効なチャンネル'
                })
                return
            }
            const gateMessage = await gateChannel?.messages.fetch(a.message);
            await gateMessage.edit({
                embeds: [gateEmbeds[gateName]]
            })
            await interaction.reply({
                ephemeral: true,
                content: '更新しました。'
            })
            return
        }

        const btn_give = new MessageButton()
            .setCustomId(`btn_${gateName}_give`)
            .setStyle('PRIMARY')
            .setEmoji('📥')
            .setLabel('入室')
        const btn_take = new MessageButton()
            .setCustomId(`btn_${gateName}_take`)
            .setStyle('SECONDARY')
            .setEmoji('📤')
            .setLabel('退出')
        const gateEmbedMessage = await interaction.channel?.send({
            embeds: [gateEmbeds[gateName]],
            components: [
                new MessageActionRow().addComponents(btn_give).addComponents(btn_take)
            ]
        })
        await db_gate.set(
            gateName,
            {
                message: gateEmbedMessage?.id,
                channel: interaction.channelId
            }
        )
        await interaction.reply({
            ephemeral: true,
            content: '正常に投稿されました。'
        })
    }
})

client.login(process.env.DISCORD_TOKEN)