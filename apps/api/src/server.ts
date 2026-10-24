import { app } from "./app.js";
import { env } from "./env.js";
import { prisma } from "./prisma.js";

const server = app.listen(env.PORT, () => {
  console.info(`MiniLedger API is running at http://localhost:${env.PORT}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
