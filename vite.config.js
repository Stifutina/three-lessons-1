import { defineConfig } from 'vite';
import restart from 'vite-plugin-restart';

export default defineConfig({
    root: 'src/', // Sources files (typically where index.html is)
    publicDir: '../static/', // Path from "root" to static assets
    server: {
        host: true, // Open to local network and display URL
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env), // Open browser if not in sandbox
    },
    build: {
        outDir: '../dist', // Output to the dist/ folder
        emptyOutDir: true, // Empty the folder before building
        sourcemap: true, // Generate source maps
        rollupOptions: {
            input: {
                main: './src/index.html',
                lesson1: './src/pages/lessons/lesson1.html',
                lesson2: './src/pages/lessons/lesson2.html',
                lesson3: './src/pages/lessons/lesson3.html',
                lesson4: './src/pages/lessons/lesson4.html',
                lesson5: './src/pages/lessons/lesson5.html',
                lesson6: './src/pages/lessons/lesson6.html',
                lesson7: './src/pages/lessons/lesson7.html',
                lesson8: './src/pages/lessons/lesson8.html',
                lesson9: './src/pages/lessons/lesson9.html',
                lesson10: './src/pages/lessons/lesson10.html',
                lesson11: './src/pages/lessons/lesson11.html',
                lesson12: './src/pages/lessons/lesson12.html',
                lesson13: './src/pages/lessons/lesson13.html',
            },
        },
    },
    plugins: [
        restart({ restart: ['../static/**'] }), // Restart on static file changes
    ],
});
