import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// BreakoutPro - vite.config.js
// Code splitting via manualChunks to fix large-bundle warning and speed first paint.

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: function(id){
          if(id.indexOf("node_modules") >= 0){
            if(id.indexOf("react") >= 0) return "vendor-react";
            if(id.indexOf("chart") >= 0 || id.indexOf("d3") >= 0 || id.indexOf("recharts") >= 0) return "vendor-charts";
            return "vendor";
          }
          if(id.indexOf("/screens/MarketMood") >= 0) return "feature-mood";
          if(id.indexOf("/screens/PriceAction") >= 0 || id.indexOf("/screens/Guardian") >= 0) return "feature-price";
          if(id.indexOf("/screens/Scan") >= 0 || id.indexOf("/screens/Scanner") >= 0) return "feature-scan";
          if(id.indexOf("/state/") >= 0) return "registries";
          return undefined;
        }
      }
    }
  }
});
