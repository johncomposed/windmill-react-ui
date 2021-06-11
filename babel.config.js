module.exports = function babelConfig(api) {
  api.cache(false)

  return {
    presets: [
      ['@babel/preset-typescript', {}],
      // [
      //   '@babel/preset-env',
      //   {
      //     targets: {
      //       esmodules: true,
      //       node: 16,
      //     },
      //     bugfixes: false,
      //     spec: false,
      //     loose: true,
      //     modules: false,
      //     useBuiltIns: false,
      //   },
      // ],
    ],
    plugins: [
      '@babel/plugin-syntax-jsx',
      '@babel/plugin-proposal-class-properties',
      ['babel-plugin-typescript-to-proptypes', { comments: true }],
    ],
    ignore: ['node_modules', 'build', 'dist1', 'dist*'],
  }
}
