const presets = [
    [
        '@babel/preset-env', {
        loose: true,

        targets: {
            node: 'current'
        },
    },
    ],
];

const plugins = [
    '@babel/plugin-proposal-object-rest-spread',
];

module.exports = {
    presets,
    plugins,
};