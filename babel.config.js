module.exports = function(api) {
    api.cache(true);

    return {
        presets: [
            [
                '@babel/preset-env',
                {
                    targets: 'current node',
                },
            ],
            '@babel/preset-typescript',
        ],
        plugins: [
            ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ]
    };
}