import { AccountUpdate, Mina, PrivateKey } from "o1js";
import { FungibleToken } from "./FungibleToken.js";
import { FungibleTokenAdmin } from "./FungibleTokenAdmin.js";

await FungibleToken.compile()
await FungibleTokenAdmin.compile()

const Network = Mina.Network('https://api.minascan.io/node/devnet/v1/graphql');
Mina.setActiveInstance(Network);

const deployerPrivateKey = PrivateKey.fromBase58('EKFF2aVmvdb74YakW4ya7V2KrrempdWXXukDfVkjU4V8RFoN9YsH')
const deployerAddress = deployerPrivateKey.toPublicKey();

const {privateKey: adminPrivateKey, publicKey: adminAddress} =
  PrivateKey.randomKeypair();
const {privateKey: tokenPrivateKey, publicKey: tokenAddress} =
  PrivateKey.randomKeypair();

const tokenAdmin = new FungibleTokenAdmin(adminAddress)
const token = new FungibleToken(tokenAddress);

const fee = 200_000_000;

console.log(deployerAddress.toJSON())

// Create a new instance of the contract
console.log('\n\n====== DEPLOYING ======\n\n');
const deployTx = await Mina.transaction({
  sender: deployerAddress,
  fee,
}, async () => {
  AccountUpdate.fundNewAccount(deployerAddress);

  await tokenAdmin.deploy({ adminPublicKey: deployerAddress })
  await token.deploy({
    symbol: "CREATE",
    src: "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts",
  });
});
await deployTx.prove();
const pendingTx = await deployTx.sign([tokenPrivateKey, adminPrivateKey, deployerPrivateKey]).send();

await pendingTx.wait()

console.log(pendingTx.hash)