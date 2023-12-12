import * as dotenv from "dotenv";
import _ from "lodash";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Buffer } from "node:buffer";
import { Ed25519Keypair} from "@mysten/sui.js/keypairs/ed25519";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui.js/faucet';
import { execSync } from "child_process";
import path from "node:path";
import { TransactionBlock } from '@mysten/sui.js/transactions';

dotenv.config();


async function main(argv: Record<string, any>) {
  const { network } = argv;
  const { DEPLOYER_PRIVATE_KEY } = process.env;

  if (!DEPLOYER_PRIVATE_KEY) {
    throw new Error("DEPLOYER_PRIVATE_KEY is not defined");
  }

  const client = new SuiClient({ url: getFullnodeUrl('mainnet') })
  const keypair = Ed25519Keypair.fromSecretKey(
    Buffer.from(DEPLOYER_PRIVATE_KEY, "hex")
  );

  const address = keypair.getPublicKey().toSuiAddress();
  console.log("Deployer: ", address);
  // const packagePath = path.resolve(, 'sources');
  // console.log(packagePath);
  // return;

  const { modules, dependencies } = JSON.parse(
    execSync(`sui move build --dump-bytecode-as-base64 --path ${process.cwd()}`, {
      encoding: 'utf-8',
    }),
  );

  const tx = new TransactionBlock();
  const [upgradeCap] = tx.publish({
    modules,
    dependencies,
  });
  tx.transferObjects([upgradeCap], address);
  const result = await client.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: tx,
  });
  console.log({ result });
  

  // await requestSuiFromFaucetV0({
  //   host: getFaucetHost('mainnet'),
  //   recipient: address
  // })

  console.log("Deploying modules...");
  console.log({ modules, dependencies });


  
}

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 [options]")
  .option("network", {
    describe: "network to deploy",
    choices: ["devnet", "mainnet"],
    type: "string",
    demandOption: true,
  })
  .parseSync();

process.on("unhandledRejection", (err) => {
  throw err;
});

main(argv);
