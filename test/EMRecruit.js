const { expect } = require("chai");
const { ethers } = require("hardhat");


async function mineBlocks(blockNumber) {
    while (blockNumber > 0) {
        blockNumber--;
        await hre.network.provider.request({
            method: "evm_mine",
            params: [],
        });
    }
}

const deployContract = async (owner, name, symbol, baseurl, norevealurl) => {
    const EMRecruit = await ethers.getContractFactory("EMRecruit");
    return await EMRecruit.deploy(
        name,
        symbol,
        baseurl,
        norevealurl,
        owner
    );
}

describe("EMRecruit", function () {
    let recruit;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addr4;
    let addr5;
    let addr6;
    let addr7;
    let addr8;
    let addr9;
    let addr10;
    let addrs;
    let VIP_MINTING_PERIOD;
    let VIP_MINTING_START_TIME;
    const BASE_URL = "ipfs://QmNn2iA7zq27mG8Nngpy3YcV69F2TboWqGTq7nzqJfmADh/";
    const NO_REVEAL_URL = "https://via.placeholder.com/300.png/09f/fff";
    const NAME = "EMRecruit"
    const SYMBOL = "EMAST"

    before(async () => {
        [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10, ...addrs] = await ethers.getSigners();
        VIP_MINTING_PERIOD = 200;
        VIP_MINTING_START_TIME = Math.floor(Date.now() / 1000);
    });

    describe("Deployment one version", function () {

        it("Should deploy contract", async function () {
            recruit = await deployContract(owner.address, NAME, SYMBOL, BASE_URL, NO_REVEAL_URL)
            console.log("EMRecruit deployed to:", recruit.address);
        });

        it("Should set the VIP_MINTING_START_TIME", async function () {
            await recruit.setVipSaleStartTime(VIP_MINTING_START_TIME)
            expect(await recruit.vipSaleStartTime()).to.equal(VIP_MINTING_START_TIME);
        });

        it("Should set the VIP_MINTING_PERIOD", async function () {
            await recruit.setVipMintingPeriod(VIP_MINTING_PERIOD)
            expect(await recruit.vipMintingPeriod()).to.equal(VIP_MINTING_PERIOD);
        });

        it("Should set the VIP_MINTING_PERIOD", async function () {
            await recruit.connect(owner).setLieutenantLevel(2);
            expect(await recruit.lieutenantLevel()).to.equal(2);
        });
    });

    describe("VIP period sale", async function () {
        it("Should free mint during vip period", async function () {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint8"],
                [`${addr1.address.toLowerCase()}`, now, 1]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await owner.signMessage(messageHashBinary);
            await recruit.connect(addr1).safeMint(messageHashBinary, signature, now);
        });

        it("Should not buy during vip period", async function () {
            const tx = recruit.connect(addr1).buyRecuit(1, { value: ethers.utils.parseEther("0.0069") });
            await expect(tx).to.be.revertedWith("VIP SALE PERIOD");
        });

        it("Should not buy (not vip : INVALID_SIGNATURE)", async function () {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256"],
                [`${addr1.address.toLowerCase()}`, now]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await addr1.signMessage(messageHashBinary);
            const tx = recruit.connect(addr1).vipSale(1, messageHashBinary, signature, now, { value: ethers.utils.parseEther("0.0069") });
            await expect(tx).to.be.revertedWith("INVALID_SIGNATURE");
        });

        it("Should not buy (not vip : INVALID_MESSAGE)", async function () {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256"],
                [`${addr2.address.toLowerCase()}`, now]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await owner.signMessage(messageHashBinary);
            const tx = recruit.connect(addr1).vipSale(1, messageHashBinary, signature, now, { value: ethers.utils.parseEther("0.0069") });
            await expect(tx).to.be.revertedWith("INVALID_MESSAGE");
        });


        it("Should not buy (NOT_ENOUG_FUND)", async function () {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256"],
                [`${addr1.address.toLowerCase()}`, now]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await owner.signMessage(messageHashBinary);
            const tx = recruit.connect(addr1).vipSale(1, messageHashBinary, signature, now, { value: ethers.utils.parseEther("0.0068") });
            await expect(tx).to.be.revertedWith("NOT_ENOUG_FUND");
        });

        it("Should buy 1 recruit during vip period ", async function () {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256"],
                [`${addr1.address.toLowerCase()}`, now]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await owner.signMessage(messageHashBinary);
            await recruit.connect(addr1).vipSale(1, messageHashBinary, signature, now, { value: ethers.utils.parseEther("0.0069") });
        });

        it("Should buy 999 recruit during vip period ", async function () {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256"],
                [`${addr2.address.toLowerCase()}`, now]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await owner.signMessage(messageHashBinary);
            await recruit.connect(addr2).vipSale(999, messageHashBinary, signature, now, { value: ethers.utils.parseEther("6.8931") });
        });

        it("Should free mint during vip period (cause was white listed)", async function () {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint8"],
                [`${addr10.address.toLowerCase()}`, now, 1]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await owner.signMessage(messageHashBinary);
            await recruit.connect(addr10).safeMint(messageHashBinary, signature, now);
        });

        it("buy during vip period should not be possible", async function () {
            const tx = recruit.connect(addr1).buyRecuit(1, { value: ethers.utils.parseEther("0.0069") });
            await expect(tx).to.be.revertedWith("VIP SALE PERIOD");
        });
    })

    describe("Deployment other version", function () {

        it("Should deploy contract", async function () {
            recruit = await deployContract(owner.address, NAME, SYMBOL, BASE_URL, NO_REVEAL_URL)
            console.log("EMRecruit deployed to:", recruit.address);
        });

        it("Should set the VIP_MINTING_START_TIME", async function () {
            await recruit.setVipSaleStartTime(VIP_MINTING_START_TIME)
            expect(await recruit.vipSaleStartTime()).to.equal(VIP_MINTING_START_TIME);
        });

        it("Should set the VIP_MINTING_PERIOD", async function () {
            await recruit.setVipMintingPeriod(VIP_MINTING_PERIOD)
            expect(await recruit.vipMintingPeriod()).to.equal(VIP_MINTING_PERIOD);
        });

        it("Should set the VIP_MINTING_PERIOD", async function () {
            await recruit.connect(owner).setLieutenantLevel(2);
            expect(await recruit.lieutenantLevel()).to.equal(2);
        });
    });

    describe("After VIP period sale", async function () {
        it("Should mint 300 block to pass the VIP PERIOD", async function () {
            await mineBlocks(1000)
        });

        it("Should not buy (after vip sale) ", async function () {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256"],
                [`${addr1.address.toLowerCase()}`, now]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await owner.signMessage(messageHashBinary);
            const tx = recruit.connect(addr1).vipSale(1, messageHashBinary, signature, now, { value: ethers.utils.parseEther("0.0069") });
            await expect(tx).to.be.revertedWith("VIP SALE PERIOD OVER");
        });

        it("Mint should not be possible (invalid signature error)", async () => {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint8"],
                [`${addr1.address.toLowerCase()}`, now, 1]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await addr1.signMessage(messageHashBinary);
            const tx = recruit.connect(addr1).safeMint(messageHashBinary, signature, now);
            await expect(tx).to.be.revertedWith("INVALID_SIGNATURE");
        });

        it("Mint should not be possible (invalid message error)", async () => {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint8"],
                [`${addr2.address.toLowerCase()}`, now, 1]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await owner.signMessage(messageHashBinary);
            const tx = recruit.connect(addr1).safeMint(messageHashBinary, signature, now);
            await expect(tx).to.be.revertedWith("INVALID_MESSAGE");
        });


        it("Mint should not be possible (invalid message error)", async () => {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint8"],
                [`${addr1.address.toLowerCase()}`, now, 2]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await owner.signMessage(messageHashBinary);
            const tx = recruit.connect(addr1).safeMint(messageHashBinary, signature, now);
            await expect(tx).to.be.revertedWith("INVALID_MESSAGE");
        });


        it("Should buy recruit for addr1 (after vip period)", async function () {
            await mineBlocks(300)
            await recruit.connect(addr1).buyRecuit(1, { value: ethers.utils.parseEther("0.0069") });
        });


        it("Should mint 1 recruit for addr1", async function () {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint8"],
                [`${addr1.address.toLowerCase()}`, now, 1]

            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await owner.signMessage(messageHashBinary);
            await recruit.connect(addr1).safeMint(messageHashBinary, signature, now);
        });


        it("Should not buy recruit for addr1 (NOT_ENOUG_FUND)", async function () {
            const tx = recruit.connect(addr1).buyRecuit(1, { value: ethers.utils.parseEther("0.0068") });
            await expect(tx).to.be.revertedWith("NOT_ENOUG_FUND");
        });

        it("Mint should not be possible (QUANTITY_EXCEEDED error)", async () => {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint8"],
                [`${addr1.address.toLowerCase()}`, now, 1]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await owner.signMessage(messageHashBinary);
            const tx = recruit.connect(addr1).safeMint(messageHashBinary, signature, now);
            await expect(tx).to.be.revertedWith("QUANTITY_EXCEEDED");
        });
    })

    describe("Air drops", async function () {

        it("should not mint by owner (not the owner error)", async function () {
            const tx = recruit.connect(addr1).safeMintByOwner(addr2.address, 3);
            await expect(tx).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it("should not mint batch by owner (not the owner error)", async function () {
            const tx = recruit.connect(addr1).safeMintBatchByOwner([addr3.address, addr4.address, addr5.address], [2, 3, 4]);
            await expect(tx).to.be.revertedWith('Ownable: caller is not the owner');

        });

        it("owner should mint 3 recruits for addr2", async function () {
            await recruit.connect(owner).safeMintByOwner(addr2.address, 3);
        });

        it("owner should mint a batch recruits for addr3, addr4, and addr5", async function () {
            await recruit.connect(owner).safeMintBatchByOwner([addr3.address, addr4.address, addr5.address], [2, 3, 4]);
        });

        it("owner can not min 0 quantity", async function () {
            const tx = recruit.connect(owner).safeMintByOwner(addr2.address, 0);
            await expect(tx).to.be.revertedWith("0 IS NOT VALID QUANTIIY");
        });

        it("owner can not min for x0000000000000000000000000000000000000000", async function () {
            const tx = recruit.connect(owner).safeMintByOwner("0x0000000000000000000000000000000000000000", 4);
            await expect(tx).to.be.revertedWith("0 IS NOT A VALID ADDRESS");
        });

        it("owner can not min 0 quantity", async function () {
            const tx = recruit.connect(owner).safeMintBatchByOwner([addr3.address, addr4.address, addr5.address], [2, 0, 4]);
            await expect(tx).to.be.revertedWith("0 IS NOT VALID QUANTIIY");
        });

        it("owner can not min for x0000000000000000000000000000000000000000", async function () {
            const tx = recruit.connect(owner).safeMintBatchByOwner([addr3.address, "0x0000000000000000000000000000000000000000", addr5.address], [2, 0, 4]);
            await expect(tx).to.be.revertedWith("0 IS NOT A VALID ADDRESS");
        });

    })

    describe("User tokens and metadatas", async function () {

        it("Should get recruit of addr1", async function () {
            const recruits = await recruit.tokensOfOwner(addr1.address);
            console.log("addr1 recruits: ==> :", recruits)
        });

        it("Should get recruit of addr5", async function () {
            const recruits = await recruit.tokensOfOwner(addr5.address);
            console.log("addr5 recruits: ==> :", recruits)
        });

        it("Should get recruit of addr2", async function () {
            const recruits = await recruit.tokensOfOwner(addr2.address);
            console.log("addr2 recruits: ==> :", recruits)
        });


        it("Should get uris before reveale", async function () {
            const totalSupply = await recruit.totalSupply()
            const otherTokensCount = 3 //totalSupply - 1050;
            console.log("totalSupply", totalSupply)
            for (let index = 1; index <= otherTokensCount; index++) {
                const url = await recruit.tokenURI(1050 + index);
                console.log(`token ${1050 + index} uri before reveale: ==> :`, url)
            }

        });

        it("Should set reveale", async function () {
            recruit.connect(owner).setRevealed(true)
        });

        it("Should get uris after reveale", async function () {
            const totalSupply = await recruit.totalSupply()
            const otherTokensCount = 3 //totalSupply - 1050;
            console.log("totalSupply", totalSupply)
            for (let index = 1; index <= otherTokensCount; index++) {
                const url = await recruit.tokenURI(1050 + index);
                console.log(`token ${1050 + index} uri after reveale: ==> :`, url)
            }
        });

        it("Should set baseURI", async function () {
            await recruit.connect(owner).setBaseURI("recruit-base-uri-2/");
        });

        it("Should get uris after reveale", async function () {
            const totalSupply = await recruit.totalSupply()
            const otherTokensCount = 3 //totalSupply - 1050;
            console.log("totalSupply", totalSupply)
            for (let index = 1; index <= otherTokensCount; index++) {
                const url = await recruit.tokenURI(1050 + index);
                console.log(`token ${1050 + index} uri after reveale: ==> :`, url)
            }
        });

        it("Owner can set toke 1052 custom uri", async function () {
            await recruit.connect(owner).setTokenURIByOnwer(1052, "recruit/custom-uri-by-owner/1052");
        });

        it("Should get token 1052 uri after cutom uri setting", async function () {
            const url = await recruit.tokenURI(1052);
            console.log("token 1052 uri afer reveale: ==> :", url)
        });
    })

    describe("Pause and unpause contract", async function () {


        it("Mint should not be possible due to the pause of the contract", async () => {
            const now = Math.floor(Date.now() / 1000);
            await recruit.connect(owner).pause();
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint8"],
                [`${addr1.address.toLowerCase()}`, now, 1]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await owner.signMessage(messageHashBinary);
            const tx = recruit.connect(addr1).safeMint(messageHashBinary, signature, now);
            await expect(tx).to.be.revertedWith("Pausable: paused");
        });

        it("Should mint 1 recruit for addr6", async function () {
            const now = Math.floor(Date.now() / 1000);

            await recruit.connect(owner).unpause();
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint8"],
                [`${addr6.address.toLowerCase()}`, now, 1]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await owner.signMessage(messageHashBinary);
            await recruit.connect(addr6).safeMint(messageHashBinary, signature, now);
        });

        it("addss1 can not pause", async function () {
            const tx = recruit.connect(addr1).pause();
            await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("addss1 can not unpause", async function () {
            const tx = recruit.connect(addr1).unpause();
            await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
        });


    })

    describe("Update signer", async function () {
        it("addss1 can not set setSystemAddress", async function () {
            const tx = recruit.connect(addr1).setSystemSigner(addr1.address);
            await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should set setSystemAddress", async function () {
            await recruit.connect(owner).setSystemSigner(addr10.address);
        });

        it("Should not mint 1 recruit for addr7 (invalid signature)", async function () {
            const now = Math.floor(Date.now() / 1000);

            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint8"],
                [`${addr7.address.toLowerCase()}`, now, 1]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await addr9.signMessage(messageHashBinary);
            const tx = recruit.connect(addr7).safeMint(messageHashBinary, signature, now);
            await expect(tx).to.be.revertedWith("INVALID_SIGNATURE");
        });

        it("Should mint 1 recruit for addr7", async function () {
            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint8"],
                [`${addr7.address.toLowerCase()}`, now, 1]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await addr10.signMessage(messageHashBinary);
            await recruit.connect(addr7).safeMint(messageHashBinary, signature, now);
        });

    })

    describe("Level up and sale of recruit", async function () {
        it("Should not transfer 1053 (need min lieutnant level)", async function () {
            const tx = recruit.connect(addr2).transferFrom(addr2.address, addr1.address, 1053)
            await expect(tx).to.be.revertedWith("NEED TO LEVELUP TO LIEUTENANT");
        });

        it("Should not transfer 1061 (need min lieutnant level) : even for the give away", async function () {
            const tx = recruit.connect(addr5).transferFrom(addr5.address, addr1.address, 1061)
            await expect(tx).to.be.revertedWith("NEED TO LEVELUP TO LIEUTENANT");
        });

        it("level up token 1053 2 time to become lieutenant", async function () {

            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint8"],
                [`${addr2.address.toLowerCase()}`, now, 2]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await addr10.signMessage(messageHashBinary);

            await recruit.connect(addr2).levelUp(messageHashBinary, signature, now, 1053, 2);
        });

        it("Should transfer 1053", async function () {
            await recruit.connect(addr2).transferFrom(addr2.address, addr1.address, 1053)
        });

        it("Should get recruit of addr1", async function () {
            const recruits = await recruit.tokensOfOwner(addr1.address);
            console.log("addr1 recruits: ==> :", recruits)
        });

        it("Should buy recruit for addr6 (after vip period)", async function () {
            await mineBlocks(300)
            await recruit.connect(addr6).buyRecuit(1, { value: ethers.utils.parseEther("0.0069") });
        });

        it("Should get recruit of addr6", async function () {
            const recruits = await recruit.tokensOfOwner(addr6.address);
            console.log("addr6 recruits: ==> :", recruits)
        });

        it("transfer of 1067 should not be possible", async function () {
            const tx = recruit.connect(addr6).transferFrom(addr6.address, addr1.address, 1067)
            await expect(tx).to.be.revertedWith("NEED TO LEVELUP TO LIEUTENANT");
        });

        it("level up token 1053 2 time to become lieutenant", async function () {

            const now = Math.floor(Date.now() / 1000);
            let messageHash = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint8"],
                [`${addr6.address.toLowerCase()}`, now, 2]
            );
            let messageHashBinary = ethers.utils.arrayify(messageHash);
            let signature = await addr10.signMessage(messageHashBinary);

            await recruit.connect(addr6).levelUp(messageHashBinary, signature, now, 1067, 2);
        });

        it("should transfer 1067", async function () {
            await recruit.connect(addr6).transferFrom(addr6.address, addr1.address, 1067)
        });


        it("Should get recruit of addr6", async function () {
            const recruits = await recruit.tokensOfOwner(addr6.address);
            console.log("addr6 recruits: ==> :", recruits)
        });

        it("Should get recruit of addr1", async function () {
            const recruits = await recruit.tokensOfOwner(addr1.address);
            console.log("addr1 recruits: ==> :", recruits)
        });

        it("Should not transfer 1065 (need min lieutnant level)", async function () {
            const tx = recruit.connect(addr6).transferFrom(addr6.address, addr1.address, 1065)
            await expect(tx).to.be.revertedWith("NEED TO LEVELUP TO LIEUTENANT");
        });

        it("should not pay for level up 1065 for 2 level to lieutnant", async function () {
            const tx = recruit.connect(addr6).payForlevelUp(1065, 10, { value: ethers.utils.parseEther("0.069") })
            await expect(tx).to.be.revertedWith("MAXIMUM_LEVEL_EXCEEDED");
        });

        it("should pay for level up 1065 for 2 level to lieutnant", async function () {
            await recruit.connect(addr6).payForlevelUp(1065, 3, { value: ethers.utils.parseEther("0.207") })
        });

        it("Should transfer 1065", async function () {
            await recruit.connect(addr6).transferFrom(addr6.address, addr1.address, 1065)
        });

        it("Should not transfer 1062 (need min lieutnant level)", async function () {
            const tx = recruit.connect(addr5).transferFrom(addr5.address, addr1.address, 1062)
            await expect(tx).to.be.revertedWith("NEED TO LEVELUP TO LIEUTENANT");
        });

        it("should not level up 1062 by owner for 2 level to lieutnant", async function () {
            const tx = recruit.connect(owner).levelUpByOwner(1062, 10)
            await expect(tx).to.be.revertedWith("MAXIMUM_LEVEL_EXCEEDED");
        });

        it("should level up 1062 by owner for 2 level to lieutnant", async function () {
            await recruit.connect(owner).levelUpByOwner(1062, 2)
        });

        it("Should transfer 1062", async function () {
            await recruit.connect(addr5).transferFrom(addr5.address, addr1.address, 1062)
        });
    })

    describe("withdraw", async function () {

        it("Should not withdraw all funds", async function () {
            const tx = recruit.connect(addr1).withdraw()
            await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should withdraw all funds", async function () {
            await recruit.connect(owner).withdraw()
        });
    })
});