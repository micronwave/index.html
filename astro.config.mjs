import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://aaronaltergott.cv',
  integrations: [react()],
  output: 'static',
  vite: {
    optimizeDeps: {
      include: ['react/jsx-dev-runtime', 'react/jsx-runtime'],
    },
  },
});
