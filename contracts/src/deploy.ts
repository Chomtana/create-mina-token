import { AccountUpdate, Bool, Mina, PrivateKey, UInt8 } from "o1js";
import { FungibleToken } from "./FungibleToken.js";
import { FungibleTokenAdmin } from "./FungibleTokenAdmin.js";

await FungibleToken.compile()
await FungibleTokenAdmin.compile()

interface DeployMinaTokenParams {
  network: string // https://api.minascan.io/node/devnet/v1/graphql
  privateKey: string
  symbol: string
  decimal?: number
  initialSupply: bigint
}

export async function deployMinaToken(params: DeployMinaTokenParams) {
  const Network = Mina.Network(params.network);
  Mina.setActiveInstance(Network);
  
  const deployerPrivateKey = PrivateKey.fromBase58(params.privateKey)
  const deployerAddress = deployerPrivateKey.toPublicKey();
  
  const {privateKey: adminPrivateKey, publicKey: adminAddress} =
    PrivateKey.randomKeypair();
  const {privateKey: tokenPrivateKey, publicKey: tokenAddress} =
    PrivateKey.randomKeypair();
  
  const tokenAdmin = new FungibleTokenAdmin(adminAddress)
  const token = new FungibleToken(tokenAddress);
  
  const fee = 100_000_000;
  
  console.log('Deployer Address:', deployerAddress.toJSON())
  
  // Create a new instance of the contract
  console.log('\n\n====== DEPLOYING ======\n\n');
  const deployTx = await Mina.transaction({
    sender: deployerAddress,
    fee,
  }, async () => {
    AccountUpdate.fundNewAccount(deployerAddress, 3);
  
    await tokenAdmin.deploy({ adminPublicKey: deployerAddress })
    await token.deploy({
      symbol: params.symbol,
      src: "https://github.com/Chomtana/create-mina-token/blob/main/contracts/src/FungibleToken.ts",
    });
    await token.initialize(adminAddress, UInt8.from(params.decimal ?? 6), Bool(false));
  });
  await deployTx.prove();
  const pendingTx = await deployTx.sign([tokenPrivateKey, adminPrivateKey, deployerPrivateKey]).send();
  
  await pendingTx.wait()

  console.log('Transaction Hash:', pendingTx.hash)
  console.log('Token Address:', tokenAddress.toBase58())
  console.log('Admin Address:', adminAddress.toBase58())
}