try { process.loadEnvFile(); } catch { /* PM2/VPS may inject env directly. */ }
import { AuctionSyncService } from "../src/lib/auction-sync-service";

const result = await new AuctionSyncService().syncVehicles();
console.log(JSON.stringify(result, null, 2));
if (result.status === "FAILED") process.exitCode = 1;
