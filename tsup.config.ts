import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index:   'src/index.ts',
    react:   'src/react.ts',
    vanilla: 'src/vanilla.ts',
    vue:     'src/vue.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'vue'],
  noExternal: [],
  treeshake: true,
  splitting: false,
})
