import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://altergott.dev',
  integrations: [react()],
  output: 'static',
  vite: {
    optimizeDeps: {
      include: ['react/jsx-dev-runtime', 'react/jsx-runtime'],
    },
  },
});
