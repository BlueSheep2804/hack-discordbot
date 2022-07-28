const dotenv = require('dotenv')

dotenv.config()

import { Interaction } from "discord.js"
import { Command } from "./command"
const { Client, Intents } = require('discord.js')

const client = new Client({ intents: Object.keys(Intents.FLAGS) })

const command = new Command()

client.once("ready", async () => {
    await command.generateGateList()
    command.generateCommandList()
    await client.application.commands.set(command.commandList, '844175560044445716')

    console.log('/==============/')
    console.log(client.user.tag)
    console.log('/==============/')
})

client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isButton()) {
        if (Array.isArray(interaction.member?.roles)) return
        for (const i in command.gateRoles) {
            if (`btn_${i}_give` === interaction.customId) {
                await interaction.member?.roles.add(command.gateRoles[i])
                await interaction.reply({
                    content: ':inbox_tray: 入室しました',
                    ephemeral: true
                })
                return
            }
            if (`btn_${i}_take` === interaction.customId) {
                await interaction.member?.roles.remove(command.gateRoles[i])
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
    try {
        const invokedCommand = command.commandList.find(
            (v) => v.name === interaction.commandName
        )
        await invokedCommand?.execute(interaction, command)
    } catch (e) {
        console.log(e)
    }
})

client.login(process.env.DISCORD_TOKEN)