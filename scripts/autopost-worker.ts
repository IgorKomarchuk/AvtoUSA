try { process.loadEnvFile(); } catch { /* PM2 may inject env directly. */ }

import { AuctionSyncService } from "../src/lib/auction-sync-service";
import { AutopostingService } from "../src/lib/autoposting-service";
import { getPrisma } from "../src/lib/prisma";

const minute = 60_000;
let running = false;

function localParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: process.env.TIMEZONE ?? "Europe/Kyiv", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

async function claimAuctionSlot() {
  const prisma = getPrisma();
  if (!prisma || (process.env.AUCTION_SYNC_MODE ?? "free") !== "free") return false;
  const parts = localParts();
  if (!(["01", "13"].includes(parts.hour)) || Number(parts.minute) > 9) return false;
  const slot = `${parts.year}-${parts.month}-${parts.day}-${parts.hour}`;
  const setting = await prisma.siteSetting.findUnique({ where: { key: "worker_last_auction_slot" } });
  if (setting?.value === slot) return false;
  await prisma.siteSetting.upsert({ where: { key: "worker_last_auction_slot" }, create: { key: "worker_last_auction_slot", value: slot }, update: { value: slot } });
  return true;
}

async function tick() {
  if (running) return;
  running = true;
  try {
    const autopost = new AutopostingService();
    await autopost.ensureDefaults();
    await autopost.processQueue(5);
    const parts = localParts();
    if (Number(parts.minute) % 15 === 0) await autopost.enqueueCandidates();
    if (Number(parts.minute) % 30 === 5) await autopost.retryFailed();
    if (parts.hour === "03" && Number(parts.minute) < 10) await autopost.cleanupOldQueueItems();
    if (await claimAuctionSlot()) {
      const auctions = new AuctionSyncService();
      await auctions.syncVehicles();
      await auctions.cleanupExpiredLots();
      await autopost.enqueueCandidates();
    }
  } catch (error) {
    console.error("background tick failed", error instanceof Error ? error.message : error);
  } finally {
    running = false;
  }
}

void tick();
const timer = setInterval(tick, minute);
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => { clearInterval(timer); process.exit(0); });
