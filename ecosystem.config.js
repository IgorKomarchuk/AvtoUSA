module.exports = {
  apps: [
    {
      name: "drivestate-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "900M",
      time: true,
      env: { NODE_ENV: "production", TZ: "Europe/Kyiv" },
    },
    {
      name: "drivestate-worker",
      script: "scripts/autopost-worker.ts",
      interpreter: "node",
      node_args: "--conditions=react-server --import ./scripts/tsx-runtime-shim.mjs --import tsx",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "450M",
      time: true,
      env: { NODE_ENV: "production", TZ: "Europe/Kyiv", NODE_OPTIONS: "--conditions=react-server" },
    },
  ],
};
