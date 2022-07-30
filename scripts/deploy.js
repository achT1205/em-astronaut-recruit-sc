const { ethers } = require("hardhat");
const fs = require('fs');

main = async () => {
  [owner, ...addrs] = await ethers.getSigners();

  const EMRecruit = await ethers.getContractFactory("EMRecruit");

  systemAddress = "0x5e1A111B28d10e5029B7b654410860B7A26e2437" //process.env.HARDHAT_NETWORK === "localhost" ? owner.address : "0x5e1A111B28d10e5029B7b654410860B7A26e2437";

  recruit = await EMRecruit.deploy(
    "EMEMRecruit",
    "EMAST",
    "ipfs://Qmd3ijfPjFuNmuHzmfLdABeDzuSLbXbzT1ZNU6fnNMTCvj/",
    "https://ipfs.io/ipfs/QmUmAbSr5pkXN2Jxih981uUND7z1wnEkS131tLjnAxRJMM/noreveal.png",
    systemAddress
  );

  await recruit.deployed();
  await recruit.connect(owner).setRevealed(true)
  await recruit.connect(owner).setVipSaleStartTime(Math.floor(Date.now() / 1000))
  await recruit.connect(owner).setMaximumLevel(5)
  await recruit.connect(owner).setOperator(owner.address, true)

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
    "EMEMRecruit",
    "EMAST",
    "ipfs://Qmd3ijfPjFuNmuHzmfLdABeDzuSLbXbzT1ZNU6fnNMTCvj/",
    "https://ipfs.io/ipfs/QmUmAbSr5pkXN2Jxih981uUND7z1wnEkS131tLjnAxRJMM/noreveal.png",
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