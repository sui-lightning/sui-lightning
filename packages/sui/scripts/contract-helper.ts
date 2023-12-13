import * as dotenv from "dotenv";
import _ from "lodash";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Buffer } from "node:buffer";
import { Ed25519Keypair} from "@mysten/sui.js/keypairs/ed25519";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui.js/faucet';
import { bcs } from "@mysten/sui.js/bcs"
import { execSync } from "child_process";
import path from "node:path";
import { TransactionBlock } from '@mysten/sui.js/transactions';

dotenv.config();

const PACKAGE_ID: string = "0xfa91e9dcff56cc0f47cd3b844543b111f5625b605d5db5042b37572112f506d6";
const VAULT_ID = "0xae96b2bff38304ab52c1dbc5e1535d6445202e146d87c35a310acde08edf121e";
async function lockObject(client: SuiClient, keypair: Ed25519Keypair, address: string, objectId: string, hash: string) {
  const tx = new TransactionBlock();
  // arguments?: (TransactionArgument | SerializedBcs<any>)[];
  // typeArguments?: string[];
  // target: `${string}::${string}::${string}`;

  // txb.)),
  const bytes = bcs.vector(bcs.U8).serialize([0x11, 0x22, 0x33, 0x44]).toBytes();
  console.log(bytes);
  tx.moveCall({
    target: `${PACKAGE_ID}::object_lock::lock_with_hash` as any,
    typeArguments: [
      "0x2::coin::Coin<0x2::sui::SUI>",
    ],
    arguments: [
      tx.object(VAULT_ID),
      tx.pure(bcs.vector(bcs.U8).serialize([0x11, 0x22, 0x33, 0x44])),
      tx.object(objectId),
      tx.pure(bcs.vector(bcs.U8).serialize([0x11, 0x22, 0x33, 0x44])),
    ]
  })

  const result = await client.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: tx,
  });
  console.log({ result });
  
}

async function scan(client: SuiClient, keypair: Ed25519Keypair) {
  const tx = new TransactionBlock();
  // arguments?: (TransactionArgument | SerializedBcs<any>)[];
  // typeArguments?: string[];
  // target: `${string}::${string}::${string}`;

  // txb.)),
  // const bytes = bcs.vector(bcs.U8).serialize([0x11, 0x22, 0x33, 0x44]).toBytes();
  // console.log(bytes);
  // tx.moveCall({
  //   target: `${PACKAGE_ID}::object_lock::lock_with_hash` as any,
  //   typeArguments: [
  //     "0x2::coin::Coin<0x2::sui::SUI>",
  //   ],
  //   arguments: [
  //     tx.object(VAULT_ID),
  //     tx.pure(bcs.vector(bcs.U8).serialize([0x11, 0x22, 0x33, 0x44])),
  //     tx.object(objectId),
  //     tx.pure(bcs.vector(bcs.U8).serialize([0x11, 0x22, 0x33, 0x44])),
  //   ]
  // })
  const dynamicFields = await client.getDynamicFields({
    parentId: VAULT_ID
  });

  const dynamicObjects = await Promise.all(dynamicFields.data.map(field => (
    client.getDynamicFieldObject({
      parentId: VAULT_ID,
      name: {
        type: field.name.type,
        value: field.name.value,
      }
    })
  )));

  console.dir(dynamicObjects, { depth: null });

  // const result = await client.signAndExecuteTransactionBlock({
  //   signer: keypair,
  //   transactionBlock: tx,
  // });
  // console.log({ result });
  
}


async function listObjects(client: SuiClient, address: string) {
  const { data } = await client.getOwnedObjects({ owner: address, options: { showContent: true } });
  client.getDynamicFieldObject
  console.dir(data, { depth: null });
}

async function main(argv: Record<string, any>) {
  // return;
  const { network } = argv;
  const cmdName = argv["_"][0];
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


  switch (cmdName) {
    case "list-object": {
      await listObjects(client, address);
      break;
    }
    case "lock-object": {
      const { objectId, hash } = argv;
      // console.log(argv);
      await lockObject(client, keypair, address, objectId, hash);
      break;
    }
    case "scan": {
      await scan(client, keypair);
      break;
    }
    default: {
      throw new Error(`Unknown command: ${cmdName}`);
    }
  }
  
  // const packagePath = path.resolve(, 'sources');
  // console.log(packagePath);
  // return;

  // const { modules, dependencies } = JSON.parse(
  //   execSync(`sui move build --dump-bytecode-as-base64 --path ${process.cwd()}`, {
  //     encoding: 'utf-8',
  //   }),
  // );

  // const tx = new TransactionBlock();
  // const [upgradeCap] = tx.publish({
  //   modules,
  //   dependencies,
  // });
  // tx.transferObjects([upgradeCap], address);
  // const result = await client.signAndExecuteTransactionBlock({
  //   signer: keypair,
  //   transactionBlock: tx,
  // });
  // console.log({ result });
  

  // await requestSuiFromFaucetV0({
  //   host: getFaucetHost('mainnet'),
  //   recipient: address
  // })

  // console.log("Deploying modules...");
  // console.log({ modules, dependencies });


  
}

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 [options]")
  .option("network", {
    describe: "network to deploy",
    choices: ["devnet", "mainnet"],
    default: "mainnet",
    type: "string",
    demandOption: false,
  })
  .demandCommand()
  .command("list-object", "list all objects owned")
  .command("lock-object", "lock an object", (yargs) => {
    yargs
    .option("objectId", {
      describe: "object id to lock",
      type: "string",
      demandOption: true,
    })
    .option("hash", {
      describe: "hash of the preimage",
      type: "string",
      demandOption: true,
    })
  })
  .command("scan", "scan all objects owned")
  .parseSync();

process.on("unhandledRejection", (err) => {
  throw err;
});

main(argv);
