import { spawn } from "node:child_process";

const children = [];

function start(name, command, args, env = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    env: { ...process.env, ...env }
  });
  children.push(child);
  child.on("exit", (code, signal) => {
    if (signal) return;
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      shutdown(code);
    }
  });
}

function shutdown(code = 0) {
  for (const child of children) child.kill("SIGTERM");
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

start("api", "node", ["server/index.mjs"], {
  PORT: process.env.API_PORT ?? "8787",
  STATIC_DIR: ""
});
start("vite", "vite", ["--host", "0.0.0.0", "--port", "5173"]);
