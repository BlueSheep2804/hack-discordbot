import {
    DiscordAPIError,
    MessageActionRow,
    MessageButton,
    CommandInteraction,
    ChatInputApplicationCommandData,
    ApplicationCommandOptionChoiceData
} from 'discord.js';

import { db_gate } from './db';
import { Gate } from './gate';

interface ChatInputApplicationCommandDataWithFunction extends ChatInputApplicationCommandData {
    execute: Function | Record<string, Function>
};

export class Command {
    commandList: ChatInputApplicationCommandDataWithFunction[] = [];

    constructor() {};

    generateCommandList(gateOptions: ApplicationCommandOptionChoiceData[]) {
        this.commandList = [
            {
                name: 'gate',
                description: 'ゲート関係のコマンド',
                options: [
                    {
                        type: 'SUB_COMMAND',
                        name: 'create',
                        description: 'チャンネルに入るためのゲートを作ります。管理者権限が必要です。',
                        options: [
                            {
                                type: 'STRING',
                                name: 'ゲート名',
                                description: '対象となるゲートを指定します',
                                required: true,
                                choices: gateOptions
                            }
                        ]
                    },
                    {
                        type: 'SUB_COMMAND',
                        name: 'update',
                        description: '作成済みのゲートを更新します。管理者権限が必要です。',
                        options: [
                            {
                                type: 'STRING',
                                name: 'ゲート名',
                                description: '対象となるゲートを指定します',
                                required: true,
                                choices: gateOptions
                            }
                        ]
                    }
                ],
                execute: {
                    create: async (interaction: CommandInteraction, gate: Gate) => {
                        const gateName = interaction.options.getString('ゲート名')
                        if (!gateName) return
                        if (!(gateName in gate.gateList)) {
                            await interaction.reply({
                                ephemeral: true,
                                content: 'エラー: 無効なゲート名です'
                            })
                            return
                        }

                        if (await db_gate.has(gateName)) {
                            await interaction.reply({
                                ephemeral: true,
                                content: 'エラー: すでに対象のゲートが作成されています'
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
                            embeds: [gate.gateList[gateName].embed],
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
                    },
                    update: async (interaction: CommandInteraction, gate: Gate) => {
                        const gateName = interaction.options.getString('ゲート名')
                        if (!gateName) return
                        if (!(gateName in gate.gateList)) {
                            await interaction.reply({
                                ephemeral: true,
                                content: 'エラー: 無効なゲート名です'
                            })
                            return
                        }

                        if (!(await db_gate.has(gateName))) {
                            interaction.reply({
                                ephemeral: true,
                                content: 'エラー: 対象のゲートが存在しません'
                            })
                            return
                        }

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
                            embeds: [gate.gateList[gateName].embed]
                        })
                        await interaction.reply({
                            ephemeral: true,
                            content: '更新しました。'
                        })
                    }
                }
            }
        ];
    };
};
