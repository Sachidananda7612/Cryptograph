import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        aim: resolve(__dirname, 'aim.html'),
        theory: resolve(__dirname, 'theory.html'),
        objective: resolve(__dirname, 'objective.html'),
        procedure: resolve(__dirname, 'procedure.html'),
        simulation: resolve(__dirname, 'simulation.html'),
        references: resolve(__dirname, 'references.html')
      }
    }
  }
});
