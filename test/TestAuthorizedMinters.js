const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuthorizedMinters", function () {
    let AuthorizedMinters;
    let authorizedMinters;
    let contractOwner;
    let minter;
    let addr1;
    let addr2;
    const royaltyPercentage = 500; // 5%

    before(async function () {
        [contractOwner, minter, addr1, addr2] = await ethers.getSigners();

        // Deploy AuthorizedMinters contract
        AuthorizedMinters = await ethers.getContractFactory("AuthorizedMinters");
        authorizedMinters = await AuthorizedMinters.connect(contractOwner).deploy();
    });

    describe("Deployment", function () {
        it("Should set the right contractOwner", async function () {
            expect(await authorizedMinters.contractOwner()).to.equal(contractOwner.address);
        });
    });

    describe("Adding Minters", function () {

        it("Should not allow non-contractOwner to add minter", async function () {
            await expect(
                authorizedMinters.connect(addr1).addMinter(minter.address, "Rolex", "Orchard Road", royaltyPercentage)
            ).to.be.revertedWith("Caller is not the contractOwner");
        });

        it("Should not allow adding minter with invalid royalty percentage", async function () {
            await expect(
                authorizedMinters.connect(contractOwner).addMinter(minter.address, "Rolex", "Orchard Road", 10001)
            ).to.be.revertedWith("Royalty percentage exceeds 100%");
        });


        it("Should not allow empty brand name", async function () {
            await expect(
                authorizedMinters.connect(contractOwner).addMinter(minter.address, "", "Orchard Road", royaltyPercentage)
            ).to.be.revertedWith("Brand name cannot be empty");
        });
        it("Should not allow empty location", async function () {
            await expect(
                authorizedMinters.connect(contractOwner).addMinter(minter.address, "Rolex", "", royaltyPercentage)
            ).to.be.revertedWith("Location cannot be empty");
    });


        it("Should add a minter", async function () {
            await expect (authorizedMinters.connect(contractOwner).addMinter(minter.address, "Rolex", "Orchard Road", royaltyPercentage)
            )   
                .to.emit(authorizedMinters, "MinterAdded")
                .withArgs(minter.address);

            expect(await authorizedMinters.isMinter(minter.address)).to.be.true;
            expect(await authorizedMinters.getBrand(minter.address)).to.equal("Rolex");
            expect(await authorizedMinters.getLocation(minter.address)).to.equal("Orchard Road");
            expect(await authorizedMinters.getRoyaltyPercentage(minter.address)).to.equal(royaltyPercentage);
        });

        it("Should not allow adding the same minter twice", async function () {
            await expect(
                authorizedMinters.connect(contractOwner).addMinter(minter.address, "Rolex", "Orchard Road", royaltyPercentage)
            ).to.be.revertedWith("Minter already exists");
        });

    });

    describe("Removing Minters", function () {

        it("Only contractOwner can remove a minter", async function () {
            await expect(
              authorizedMinters.connect(minter).removeMinter(minter.address)
            )
                .to.be.revertedWith("Caller is not the contractOwner");
          
            expect(await authorizedMinters.isMinter(minter.address)).to.not.be.false;
          });

        it("Should remove a minter", async function () {
            await expect(
              authorizedMinters.connect(contractOwner).removeMinter(minter.address)
            )
              .to.emit(authorizedMinters, "MinterRemoved")
              .withArgs(minter.address);
          
            expect(await authorizedMinters.isMinter(minter.address)).to.be.false;
          });

        });

});
