import { Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { OwnerManager, WhiteList } from "../../typechain-types";

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
      .setWhiteList(otherAccounts[0], true)
    ).to.be.revertedWith("caller is not the owner");
  });

  it("setWhiteList function Test", async () => {
    const tx = await whiteList
      .connect(owner)
      .setWhiteList(owner, true);
    await tx.wait();

    await expect(tx)
    .to.emit(whiteList, "WhiteListUpdated")
    .withArgs(await owner.getAddress(), true);

    const tx2 = await whiteList
      .connect(owner)
      .setWhiteList(owner, false);
    await tx2.wait();

    await expect(tx2)
    .to.emit(whiteList, "WhiteListUpdated")
    .withArgs(await owner.getAddress(), false);
  });
});
