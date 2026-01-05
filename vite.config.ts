import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { sveltekit } from '@sveltejs/kit/vite';



export default defineConfig(() => ({
	plugins: [
		tailwindcss(),
		sveltekit(),
		process.env.STATS
			? visualizer({ emitFile: true, filename: 'stats.html' })
			: undefined,
	],
	build: { sourcemap: true }
}));
