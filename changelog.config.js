module.exports = {
    disableEmoji: false,
    format: '{type}{scope}: {subject}',
    list: [
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'style',
        'test'
    ],
    maxMessageLength: 64,
    minMessageLength: 3,
    questions: ['type', 'scope', 'subject', 'body', 'breaking', 'issues', 'lerna'],
    scopes: [],
    types: {
        chore: {
            description: 'コード内容の変更を伴わない変更',
            emoji: '🤖',
            value: 'chore'
        },
        ci: {
            description: 'CI関連の変更',
            emoji: '🎡',
            value: 'ci'
        },
        docs: {
            description: 'ドキュメントの更新など',
            emoji: '✏️',
            value: 'docs'
        },
        feat: {
            description: '新機能の追加',
            emoji: '🎸',
            value: 'feat'
        },
        fix: {
            description: 'バグ修正',
            emoji: '🐛',
            value: 'fix'
        },
        perf: {
            description: 'パフォーマンスの向上',
            emoji: '⚡️',
            value: 'perf'
        },
        refactor: {
            description: 'リファクタリング',
            emoji: '💡',
            value: 'refactor'
        },
        release: {
            description: 'リリースコミット',
            emoji: '🏹',
            value: 'release'
        },
        style: {
            description: 'マークアップ、ホワイトスペース、フォーマット、セミコロンなどの修正',
            emoji: '💄',
            value: 'style'
        },
        test: {
            description: 'テストの追加や修正',
            emoji: '💍',
            value: 'test'
        }
    }
};