import fs from "node:fs";
import path from "node:path";
import { PreviewConfig, PreprodConfig, type Config } from "./config.js";
import { buildWalletAndWaitForFunds, configureProviders, deploy, generateSeed } from "./wallet.js";
import { currentDir } from "./config.js";

const network = process.argv[2] === "preprod" ? "preprod" : "preview";
const config: Config = network === "preprod" ? new PreprodConfig() : new PreviewConfig();

const envPath = path.resolve(currentDir, "..", ".env");

function loadOrCreateSeed(): string {
  if (fs.existsSync(envPath)) {
    const contents = fs.readFileSync(envPath, "utf8");
    const match = contents.match(/^WALLET_SEED=(.+)$/m);
    if (match) {
      console.log(`Reusing existing wallet seed from ${envPath}`);
      return match[1].trim();
    }
  }
  const seed = generateSeed();
  fs.writeFileSync(envPath, `WALLET_SEED=${seed}\n`, { mode: 0o600 });
  console.log(`Generated a fresh wallet seed and saved it to ${envPath} (gitignored).`);
  return seed;
}

async function main() {
  console.log(`\nDeploying veilbid sealed-bid contract to ${network}\n`);

  const seed = loadOrCreateSeed();
  const walletCtx = await buildWalletAndWaitForFunds(config, seed);

  try {
    const providers = await configureProviders(walletCtx, config);
    const contract = await deploy(providers, {
      bidAmount: 0n,
      bidNonce: "0".repeat(64),
      bidderId: "0".repeat(64),
      slotKey: "0".repeat(64)
    });

    const address = contract.deployTxData.public.contractAddress;
    console.log(`\n✓ Deployed on ${network}`);
    console.log(`  Contract address: ${address}\n`);
  } finally {
    await walletCtx.wallet.stop();
  }
}

main().catch((e) => {
  console.error("Deploy failed:", e);
  process.exit(1);
});
