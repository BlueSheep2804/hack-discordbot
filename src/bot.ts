const dotenv = require('dotenv')

dotenv.config()

import { ApplicationCommandOptionChoiceData, Interaction } from "discord.js"
const { Client, Intents } = require('discord.js')
import { Command } from "./command"
import { Gate } from "./gate";

const client = new Client({ intents: Object.keys(Intents.FLAGS) })

const command = new Command()
const gate = new Gate()

client.once("ready", async () => {
    await gate.generateGateList()
    const gateOptions: ApplicationCommandOptionChoiceData[] = Object.keys(gate.gateList).map((value) => {
        return {
            name: value,
            value: value
        };
    });

    console.log(gateOptions)

    command.generateCommandList(gateOptions)
    await client.application.commands.set(command.commandList, '844175560044445716')

    console.log('/==============/')
    console.log(client.user.tag)
    console.log('/==============/')
})

client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isButton()) {
        if (Array.isArray(interaction.member?.roles)) return
        for (const gateName in gate.gateList) {
            if (`btn_${gateName}_give` === interaction.customId) {
                await interaction.member?.roles.add(gate.gateList[gateName].role)
                await interaction.reply({
                    content: ':inbox_tray: 入室しました',
                    ephemeral: true
                })
                return
            }
            if (`btn_${gateName}_take` === interaction.customId) {
                await interaction.member?.roles.remove(gate.gateList[gateName].role)
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
        await invokedCommand?.execute(interaction, gate)
    } catch (e) {
        console.log(e)
    }
})

client.login(process.env.DISCORD_TOKEN)