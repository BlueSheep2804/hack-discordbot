import { CommandInteraction, DiscordAPIError, GuildChannelManager, MessageManager } from "discord.js";

export async function checkTextChannel(interaction: CommandInteraction, channelId: string, channels: GuildChannelManager) {
    try {
        const gateChannel = await channels.fetch(channelId);
        if (!gateChannel?.isText()) {
            interaction.reply({
                ephemeral: true,
                content: 'エラー: 無効なチャンネル'
            });
            return null;
        }
        return gateChannel;
    } catch (e) {
        if (e instanceof DiscordAPIError && e.message === 'Unknown Channel') {
            interaction.reply({
                ephemeral: true,
                content: 'エラー: 無効なチャンネルID'
            });
            return null;
        }
    }
    return null;
}

export async function checkMessage(interaction: CommandInteraction, messageId: string, messages: MessageManager) {
    try {
        const gateMessage = await messages.fetch(messageId);
        if (!gateMessage) {
            interaction.reply({
                ephemeral: true,
                content: 'エラー: 無効なメッセージ'
            });
            return null;
        }
        return gateMessage;
    } catch (e) {
        if (e instanceof DiscordAPIError && e.message === 'Unknown Message') {
            interaction.reply({
                ephemeral: true,
                content: 'エラー: 無効なメッセージID'
            });
            return null;
        }
    }
    return null;
}