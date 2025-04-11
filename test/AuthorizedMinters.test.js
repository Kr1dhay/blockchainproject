const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuthorizedMinters", function () {
    let AuthorizedMinters;
    let authorizedMinters;
    let owner;
    let minter;
    let addr1;
    let addr2;
    const royaltyPercentage = 500; // 5%

    beforeEach(async function () {
        [owner, minter, addr1, addr2] = await ethers.getSigners();

        // Deploy AuthorizedMinters contract
        AuthorizedMinters = await ethers.getContractFactory("AuthorizedMinters");
        authorizedMinters = await AuthorizedMinters.deploy(owner.address);
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await authorizedMinters.owner()).to.equal(owner.address);
        });
    });

    describe("Minter Management", function () {
        it("Should add a minter with royalty percentage", async function () {
            await authorizedMinters.addMinter(minter.address, royaltyPercentage);
            expect(await authorizedMinters.isMinter(minter.address)).to.be.true;
            expect(await authorizedMinters.getRoyaltyPercentage(minter.address)).to.equal(royaltyPercentage);
        });

        it("Should not allow adding minter with invalid royalty percentage", async function () {
            await expect(
                authorizedMinters.addMinter(minter.address, 10001) // More than 100%
            ).to.be.revertedWith("Royalty percentage exceeds 100%");
        });

        it("Should not allow zero address as minter", async function () {
            await expect(
                authorizedMinters.addMinter(ethers.ZeroAddress, royaltyPercentage)
            ).to.be.revertedWith("Invalid minter address");
        });

        it("Should remove a minter", async function () {
            await authorizedMinters.addMinter(minter.address, royaltyPercentage);
            await authorizedMinters.removeMinter(minter.address);
            expect(await authorizedMinters.isMinter(minter.address)).to.be.false;
        });
    });

    describe("Access Control", function () {
        it("Should not allow non-owner to add minter", async function () {
            await expect(
                authorizedMinters.connect(addr1).addMinter(minter.address, royaltyPercentage)
            ).to.be.revertedWith("Caller is not the owner");
        });

        it("Should not allow non-owner to remove minter", async function () {
            await authorizedMinters.addMinter(minter.address, royaltyPercentage);
            await expect(
                authorizedMinters.connect(addr1).removeMinter(minter.address)
            ).to.be.revertedWith("Caller is not the owner");
        });
    });

    describe("Events", function () {
        it("Should emit MinterAdded event", async function () {
            await expect(authorizedMinters.addMinter(minter.address, royaltyPercentage))
                .to.emit(authorizedMinters, "MinterAdded")
                .withArgs(minter.address);
        });

        it("Should emit MinterRemoved event", async function () {
            await authorizedMinters.addMinter(minter.address, royaltyPercentage);
            await expect(authorizedMinters.removeMinter(minter.address))
                .to.emit(authorizedMinters, "MinterRemoved")
                .withArgs(minter.address);
        });
    });

    describe("Royalty Management", function () {
        it("Should return correct royalty percentage", async function () {
            await authorizedMinters.addMinter(minter.address, royaltyPercentage);
            const result = await authorizedMinters.getRoyaltyPercentage(minter.address);
            expect(result).to.equal(royaltyPercentage);
        });

        it("Should return 0 for non-existent minter", async function () {
            const result = await authorizedMinters.getRoyaltyPercentage(addr1.address);
            expect(result).to.equal(0);
        });
    });
});