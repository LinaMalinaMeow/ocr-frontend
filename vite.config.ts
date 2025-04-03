import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
    plugins: [react({tsDecorators: true})],
    server: {
        port: 8080,
        host: '0.0.0.0',
    },
});
