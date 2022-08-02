import { APIEmbed } from 'discord-api-types/v10';
import { CommandInteraction } from 'discord.js';
import * as fs from 'fs';

interface GateData {
    role: string;
    embed: APIEmbed;
}

export class Gate {
    gateList: Record<string, GateData> = {};

    constructor() { }

    async generateGateList() {
        const gateFiles = fs.readdirSync('./src/embeds').filter(file => file.startsWith('gate_') && (file.endsWith('.js') || file.endsWith('.ts')));
        for (const file of gateFiles) {
            const gate: GateData = await import(`./embeds/${file.split('.')[0]}`);
            this.gateList[file.split('.')[0]] = gate;
        }
    }

    async checkExistGate(interaction: CommandInteraction) {
        const gateName = interaction.options.getString('ゲート名');
        if (!gateName) return false;
        if (!(gateName in this.gateList)) {
            await interaction.reply({
                ephemeral: true,
                content: 'エラー: 無効なゲート名です'
            });
            return false;
        }
        return true;
    }
}