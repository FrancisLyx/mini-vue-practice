import typescript from '@rollup/plugin-typescript'
export default {
	input: './packages/index.ts',
	output: [
		{
			format: 'cjs',
			file: './dist/index.cjs',
			sourcemap: true
		},
		{
			format: 'es',
			file: './dist/index.esm.js',
			sourcemap: true
		}
	],
	plugins: [typescript()]
}
