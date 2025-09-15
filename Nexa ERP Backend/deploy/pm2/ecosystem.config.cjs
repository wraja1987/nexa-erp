module.exports = {
  apps: [
    {
      name: "nexa-api",
      cwd: "./apps/web",
      script: "node",
      args: ".next/standalone/apps/web/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      },
      env_production: {
        NODE_ENV: "production"
      },
      max_memory_restart: "600M",
      instances: 1,
      exec_mode: "fork"
    }
  ]
};
