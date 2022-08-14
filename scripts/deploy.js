const { ethers } = require("hardhat");
const fs = require('fs');

main = async () => {
  [owner, ...addrs] = await ethers.getSigners();

  const EMRecruit = await ethers.getContractFactory("EMRecruit");

  systemAddress = "0x78BC17863D2E10904Bc5cF3d6B2a07E5b694aa3F" //process.env.HARDHAT_NETWORK === "localhost" ? owner.address : "0x78BC17863D2E10904Bc5cF3d6B2a07E5b694aa3F";

  recruit = await EMRecruit.deploy(
    "Astromust Recruit Collection",
    "ARC",
    "ipfs://QmaiWUo94cQKkVgvbeU1fiYXNQbHUUaiapVjfZTSWhhTBA/",
    "https://ipfs.io/ipfs/QmSMrCFPr4UiB9CFvUQ2hFjk9u4UBJSnQ99z9NccBcDr2x/noreveal.png",
    systemAddress
  );

  await recruit.deployed();
  await recruit.connect(owner).setRevealed(true)
  await recruit.connect(owner).setVipSaleStartTime(Math.floor(Date.now() / 1000))
  await recruit.connect(owner).setMaximumLevel(4)
  await recruit.connect(owner).setOperator(owner.address, true)
  await recruit.connect(owner).setOperator("0x78BC17863D2E10904Bc5cF3d6B2a07E5b694aa3F", true)
  await recruit.connect(owner).setOperator("0x86a4d8D9a597d948457140893D15D9E708EF14Fc", true)


  console.log("");
  console.log("");
  console.log(" ********************************************************************************** ");
  console.log(" ******************************** contract address ******************************** ");
  console.log(" ********************************************************************************** ");
  console.log("");
  console.log("EMRecruit deployed to:", recruit.address);
  console.log("");
  console.log("");
  console.log(" ********************************************************************************** ");
  console.log(" ******************************** verify scripts ********************************** ");
  console.log(" ********************************************************************************** ");
  console.log("");

  /* start generate params file for contract verify */

  const recruitcontent = `module.exports=[
    "Astromust Recruit Collection",
    "ARC",
    "ipfs://QmaiWUo94cQKkVgvbeU1fiYXNQbHUUaiapVjfZTSWhhTBA/",
    "https://ipfs.io/ipfs/QmSMrCFPr4UiB9CFvUQ2hFjk9u4UBJSnQ99z9NccBcDr2x/noreveal.png",
    "${systemAddress}"
  ];`;

  fs.writeFileSync(`arguments/${process.env.HARDHAT_NETWORK}-recruit.js`, recruitcontent);

  let verif = `npx hardhat verify ${recruit.address} --constructor-args arguments/${process.env.HARDHAT_NETWORK}-recruit.js --network ${process.env.HARDHAT_NETWORK} `
  console.log("verify recruit :", verif)
  console.log("");


}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
runMain();