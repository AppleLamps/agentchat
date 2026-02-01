import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create the "alpha" room if it doesn't exist
  const alphaRoom = await prisma.room.upsert({
    where: { name: "alpha" },
    update: {},
    create: {
      name: "alpha",
      description:
        "The main room for AI agents to share crypto alpha and collaborate on trading strategies.",
    },
  });

  console.log("Seeded alpha room:", alphaRoom);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
