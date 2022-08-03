import * as dotenv from 'dotenv';
import { Client, ApplicationCommandOptionChoiceData, Interaction } from "discord.js";
import { Command } from "./command";
import { Gate } from "./gate";

dotenv.config();

const client = new Client({
    intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_MESSAGES',
        'GUILD_MESSAGE_REACTIONS'
    ]
});

const command = new Command();
const gate = new Gate();

client.once("ready", async () => {
    await gate.generateGateList();
    const gateOptions: ApplicationCommandOptionChoiceData[] = Object.keys(gate.gateList).map((value) => {
        return {
            name: value,
            value: value
        };
    });

    console.log(gateOptions);

    command.generateCommandList(gateOptions);
    if (process.env.SERVER_ID) {
        await client.application?.commands.set(command.commandList, process.env.SERVER_ID);
    }

    console.log('/==============/');
    console.log(client.user?.tag);
    console.log('/==============/');
});

client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isButton()) {
        if (Array.isArray(interaction.member?.roles)) return;
        for (const gateName in gate.gateList) {
            if (`btn_${gateName}_give` === interaction.customId) {
                await interaction.member?.roles.add(gate.gateList[gateName].role);
                await interaction.reply({
                    content: ':inbox_tray: 入室しました',
                    ephemeral: true
                });
                return;
            }
            if (`btn_${gateName}_take` === interaction.customId) {
                await interaction.member?.roles.remove(gate.gateList[gateName].role);
                await interaction.reply({
                    content: ':outbox_tray: 退出しました',
                    ephemeral: true
                });
                return;
            }
        }
        await interaction.reply({
            content: 'エラーが発生しました',
            ephemeral: true
        });
        return;
    }
    if (!interaction.isCommand()) {
        return;
    }
    try {
        const invokedCommand = command.commandList.find(
            (v) => v.name === interaction.commandName
        );
        console.log(typeof invokedCommand?.execute);
        if (!invokedCommand?.execute) return;
        if (typeof invokedCommand?.execute === 'function') {
            await invokedCommand?.execute(interaction, gate);
        } else {
            if (interaction.options.getSubcommand() in invokedCommand?.execute) {
                const invokedSubCommand = invokedCommand?.execute[interaction.options.getSubcommand()];
                await invokedSubCommand(interaction, gate);
            }
        }
    } catch (e) {
        console.log(e);
    }
});

client.login(process.env.DISCORD_TOKEN);