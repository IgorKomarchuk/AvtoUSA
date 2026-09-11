try { process.loadEnvFile(); } catch { /* PM2/VPS may inject env directly. */ }
import { AuctionSyncService } from "../src/lib/auction-sync-service";

async function main() {
  const result = await new AuctionSyncService().syncVehicles();
  console.log(JSON.stringify(result, null, 2));
  if (result.status === "FAILED") process.exitCode = 1;
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
