import {
    MessageActionRow,
    MessageButton,
    CommandInteraction,
    ChatInputApplicationCommandData,
    ApplicationCommandOptionChoiceData
} from 'discord.js';

import { db_gate } from './db';
import { Gate } from './gate';
import { checkMessage, checkTextChannel } from './util';

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
                        if (!(await gate.checkExistGate(interaction))) return
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
                        if (!(await gate.checkExistGate(interaction))) return
                        if (!(await db_gate.has(gateName))) {
                            interaction.reply({
                                ephemeral: true,
                                content: 'エラー: 対象のゲートが存在しません'
                            })
                            return
                        }
                        const gateInfo = await db_gate.get(gateName)

                        if (!interaction.guild?.channels) return
                        const gateChannel = await checkTextChannel(
                            interaction,
                            gateInfo.channel,
                            interaction.guild?.channels
                        )
                        if (!gateChannel) return

                        if (!gateChannel?.messages) return
                        const gateMessage = await checkMessage(
                            interaction,
                            gateInfo.message,
                            gateChannel?.messages
                        )
                        if (!gateMessage) return

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
