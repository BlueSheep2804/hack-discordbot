import {
    DiscordAPIError,
    MessageActionRow,
    MessageButton,
    CommandInteraction,
    ChatInputApplicationCommandData,
    ApplicationCommandOptionChoiceData
} from 'discord.js';
import * as fs from 'fs';

import { db_gate } from './db';

interface ChatInputApplicationCommandDataWithFunction extends ChatInputApplicationCommandData {
    execute: Function
};

export class Command {
    gateEmbeds: Record<string, Record<string, string>> = {};
    gateRoles: Record<string, string> = {};
    commandList: ChatInputApplicationCommandDataWithFunction[] = [];

    constructor() {};

    async generateGateList() {
        const gateFiles = fs.readdirSync('./src/embeds').filter(file => file.startsWith('gate_') && (file.endsWith('.js') || file.endsWith('.ts')));
        for (const file of gateFiles) {
            const embed = await import(`./embeds/${file.split('.')[0]}`);
            this.gateEmbeds[file.split('.')[0]] = embed.gate;
            this.gateRoles[file.split('.')[0]] = embed.role;
        };
    };

    generateCommandList() {
        const gateOptions: ApplicationCommandOptionChoiceData[] = [];
        for (const gateName in this.gateRoles) {
            gateOptions.push({
                name: gateName,
                value: gateName
            });
        };

        this.commandList = [
            {
                name: 'gate',
                description: 'チャンネルに入るためのゲートを作ります。管理者権限が必要です。',
                options: [
                    {
                        type: 'STRING',
                        name: 'ゲート名',
                        description: '作成されるゲートを指定します',
                        required: true,
                        choices: gateOptions
                    }
                ],
                async execute(interaction: CommandInteraction, command: Command) {
                    const gateName = interaction.options.getString('ゲート名')
                    if (!gateName) return
                    if (!(gateName in command.gateRoles)) {
                        await interaction.reply({
                            ephemeral: true,
                            content: 'エラー: 無効なゲート名です'
                        })
                        return
                    }

                    if (await db_gate.has(gateName)) {
                        const a = await db_gate.get(gateName);
                        let gateChannel
                        try {
                            gateChannel = await interaction.guild?.channels.fetch(a.channel)
                        } catch (e) {
                            if (e instanceof DiscordAPIError && e.message === 'Unknown Channel') {
                                interaction.reply({
                                    ephemeral: true,
                                    content: 'エラー: 無効なチャンネルID'
                                })
                                return
                            }
                        }
                        if (!gateChannel?.isText()) {
                            interaction.reply({
                                ephemeral: true,
                                content: 'エラー: 無効なチャンネル'
                            })
                            return
                        }

                        let gateMessage
                        try {
                            gateMessage = await gateChannel?.messages.fetch(a.message)
                        } catch (e) {
                            if (e instanceof DiscordAPIError && e.message === 'Unknown Message') {
                                interaction.reply({
                                    ephemeral: true,
                                    content: 'エラー: 無効なメッセージID'
                                })
                                return
                            }
                        }
                        if (!gateMessage) {
                            interaction.reply({
                                ephemeral: true,
                                content: 'エラー: 無効なメッセージ'
                            })
                            return
                        }

                        await gateMessage.edit({
                            embeds: [command.gateEmbeds[gateName]]
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
                        embeds: [command.gateEmbeds[gateName]],
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
            }
        ];
    };
};
