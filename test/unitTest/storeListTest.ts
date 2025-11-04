import { Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { OwnerManager, StoreList } from "../../typechain-types";

describe("StoreListTest", function () {
  let owner: Signer,
    otherAccounts: Signer[],
    ownerManager: OwnerManager,
    storeList: StoreList;

  before(async () => {
    [owner, ...otherAccounts] = await ethers.getSigners();

    const OwnerManager = await ethers.getContractFactory("OwnerManager");
    ownerManager = await OwnerManager.deploy();

    const StoreList = await ethers.getContractFactory("StoreList");
    storeList = await StoreList.deploy(ownerManager.target);
  });

  // Owner가 아닌 사람이 호출 했을때
  it ("Auth Test", async () => {
    await expect(storeList
      .connect(otherAccounts[0])
      .setStoreList(await otherAccounts[0].getAddress(), true)
    ).to.be.revertedWith("caller is not the owner");
  });

  it("StoreList add", async () => {
    const tx = await storeList
      .connect(owner)
      .setStoreList(1, true);
    await tx.wait();

    expect(await storeList.storeListArray(0) == 1n);

    await expect(tx)
    .to.emit(storeList, "StoreListUpdated")
    .withArgs(1n, true);
  });

  it("StoreList delete", async () => {
    const tx = await storeList
      .connect(owner)
      .setStoreList(1n, false);
    await tx.wait();

    expect(await storeList.storeListArray(0) == 0n);

    await expect(tx)
    .to.emit(storeList, "StoreListUpdated")
    .withArgs(1n, false);

    // 잘못된 StoreId로 삭제를 시도할때
    await expect(storeList
      .connect(owner)
      .setStoreList(1n, false)
    ).to.be.revertedWithCustomError(storeList, "IncorrectStoreId");
  });
});
