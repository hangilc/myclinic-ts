import preprocess from 'svelte-preprocess'
// import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  // preprocess: sveltePreprocess(),
  preprocess: preprocess(),
  onwarn: (warning, handler) => {
  }
}
