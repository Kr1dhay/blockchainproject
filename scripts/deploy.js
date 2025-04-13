const { ethers } = require("hardhat");
const fs = require('fs');
const path = require("path");
const addressesPath = './frontend/src/contract-addresses.json';


async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy AuthorizedMinters
  const AuthorizedMinters = await ethers.getContractFactory("AuthorizedMinters");
  const authorizedMinters = await AuthorizedMinters.deploy();
  console.log("AuthorizedMinters deployed to:", await authorizedMinters.getAddress());

  // Deploy LuxuryWatchNFT
  const LuxuryWatchNFT = await ethers.getContractFactory("LuxuryWatchNFT");
  const luxuryWatchNFT = await LuxuryWatchNFT.deploy(await authorizedMinters.getAddress());
  console.log("LuxuryWatchNFT deployed to:", await luxuryWatchNFT.getAddress());

  // Deploy StolenWatchesRegistry
  const StolenWatchesRegistry = await ethers.getContractFactory("StolenWatchesRegistry");
  const stolenWatchesRegistry = await StolenWatchesRegistry.deploy(await luxuryWatchNFT.getAddress());
  console.log("StolenWatchesRegistry deployed to:", await stolenWatchesRegistry.getAddress());

  // Deploy ResellWatch
  const ResellWatch = await ethers.getContractFactory("ResellWatch");
  const resellWatch = await ResellWatch.deploy(
    await authorizedMinters.getAddress(),
    await luxuryWatchNFT.getAddress(),
    await stolenWatchesRegistry.getAddress()
  );
  console.log("ResellWatch deployed to:", await resellWatch.getAddress());

  // Set ResellWatch address in NFT contract
  await luxuryWatchNFT.setResllContractAddress(await resellWatch.getAddress());
  console.log("✅ Setup complete - ready to use!");

  // Write addresses to frontend
  const addresses = {
    AuthorizedMinters: await authorizedMinters.getAddress(),
    LuxuryWatchNFT: await luxuryWatchNFT.getAddress(),
    StolenWatchesRegistry: await stolenWatchesRegistry.getAddress(),
    ResellWatch: await resellWatch.getAddress(),
  };

  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log(`✅ Contract addresses saved to ${addressesPath}`);

  const contractsToCopy = [
    "AuthorizedMinters",
    "LuxuryWatchNFT",
    "StolenWatchesRegistry",
    "ResellWatch",
  ];
  
  contractsToCopy.forEach((contractName) => {
    const srcPath = path.resolve(__dirname, `../artifacts/contracts/${contractName}.sol/${contractName}.json`);
    const destPath = path.resolve(__dirname, `../frontend/src/artifacts/${contractName}.json`);
  
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ ABI copied to: frontend/src/artifacts/${contractName}.json`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
