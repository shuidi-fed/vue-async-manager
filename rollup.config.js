import path from 'path'
import typescript from 'rollup-plugin-typescript2'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'

const pkgMeta = require('./package.json')
const isProd = process.env.NODE_ENV === 'production'
const suffix = isProd ? 'prod' : 'dev'

export default {
  input: './src/index.ts',
  external(id) {
    return pkgMeta.peerDependencies && !!pkgMeta.peerDependencies[id]
  },
  plugins: [
    typescript({
      cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache')
    }),
    replace({ 'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development') }),
    isProd && terser()
  ],
  output: [
    {
      file: `dist/index.cjs.${suffix}.js`,
      format: 'cjs',
      exports: 'named'
    },
    {
      file: `dist/index.esm.${suffix}.js`,
      format: 'esm'
    }
  ],
  onwarn(warning, warn) {
    if (warning.code === 'UNRESOLVED_IMPORT' && isBuiltinModule(warning.source))
      return
    warn(warning)
  }
}