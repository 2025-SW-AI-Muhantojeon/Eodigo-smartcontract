import { Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { OwnerManager, WhiteList } from "../typechain-types";

describe("WhiteListTest", function () {
  let owner: Signer,
    otherAccounts: Signer[],
    ownerManager: OwnerManager,
    whiteList: WhiteList;

  before(async () => {
    [owner, ...otherAccounts] = await ethers.getSigners();

    const OwnerManager = await ethers.getContractFactory("OwnerManager");
    ownerManager = await OwnerManager.deploy();

    const WhiteList = await ethers.getContractFactory("WhiteList");
    whiteList = await WhiteList.deploy(ownerManager.target);
  });

  // Owner가 아닌 사람이 호출 했을때
  it ("Auth Test", async () => {
    await expect(whiteList
      .connect(otherAccounts[0])
      .setWhiteList(await otherAccounts[0].getAddress(), true)
    ).to.be.revertedWith("caller is not the owner");
  });

  it("WhiteList add", async () => {
    const tx = await whiteList
      .connect(owner)
      .setWhiteList(await owner.getAddress(), true);
    await tx.wait();

    await expect(tx)
    .to.emit(whiteList, "WhiteListUpdated")
    .withArgs(await owner.getAddress(), true);
  });

  it("WhiteList delete", async () => {
    const tx = await whiteList
      .connect(owner)
      .setWhiteList(await owner.getAddress(), false);
    await tx.wait();

    await expect(tx)
    .to.emit(whiteList, "WhiteListUpdated")
    .withArgs(await owner.getAddress(), false);
  });
});
