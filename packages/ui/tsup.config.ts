import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/tokens/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  external: ['react', 'next', 'lucide-react', '@easygoal/packages/auth/client'],
  clean: true,
  minify: false,
  sourcemap: true,
  treeshake: true,
});