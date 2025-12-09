import { Signer, ZeroAddress } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { OwnerManager, StoreList } from "../../typechain-types";

describe("StoreListTest", () => {
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
      .addStore(1n, owner)
    ).to.be.revertedWith("caller is not the owner");
  });

  it("StoreList add", async () => {
    // 등록후 정상 등록 검사
    const tx = await storeList
      .connect(owner)
      .addStore(1n, owner);
    await tx.wait();

    await expect(tx)
    .to.emit(storeList, "NewStore")
    .withArgs(
      1n,
      [1n, owner, true]
    );

    const store = await storeList.storeList(1n);
    expect(store.id).to.equal(1n);
    expect(store.wallet).to.equal(owner);
    expect(store.status).to.equal(true);

    const storeId = await storeList.storeIdByAddress(owner);
    expect(storeId).to.equal(1n);

    // 중복 등록 시도
    await expect(storeList
      .connect(owner)
      .addStore(1n, owner)
    ).to.be.revertedWith("already exist store");

    // 잘못된 지갑 주소로 등록시도
    await expect(storeList
      .connect(owner)
      .addStore(2n, ZeroAddress)
    ).to.be.revertedWithCustomError(storeList, "IncorrectAddress");
  });

  it("updateStoreWallet", async () => {
    const anotherAddress = await otherAccounts[0].getAddress();

    const tx = await storeList
      .connect(owner)
      .updateStoreWallet(1n, anotherAddress);
    await tx.wait();

    await expect(tx).to
      .emit(storeList, "StoreWalletUpdated")
      .withArgs(1n, anotherAddress);
    
    expect(await storeList.storeIdByAddress(owner)).to.equal(0n);
    expect(await storeList.storeIdByAddress(anotherAddress)).to.equal(1n);

    // 잘못된 storeId
    await expect(storeList
      .connect(owner)
      .updateStoreWallet(999n, anotherAddress)
    ).to.be.revertedWithCustomError(storeList, "IncorrectStoreId");

    // 잘못된 지갑 주소로 등록시도
    await expect(storeList
      .connect(owner)
      .updateStoreWallet(1n, ZeroAddress)
    ).to.be.revertedWithCustomError(storeList, "IncorrectAddress");
  });

  it("updateStoreStatus", async () => {
    const tx = await storeList
      .connect(owner)
      .updateStoreStatus(1n, false);
    await tx.wait();

    await expect(tx).to
      .emit(storeList, "StoreStatusUpdated")
      .withArgs(1n, false);

    const tx2 = await storeList
      .connect(owner)
      .updateStoreStatus(1n, true);
    await tx2.wait();

    await expect(tx2).to
      .emit(storeList, "StoreStatusUpdated")
      .withArgs(1n, true);

    // 잘못된 storeId
    await expect(storeList
      .connect(owner)
      .updateStoreStatus(999n, true)
    ).to.be.revertedWithCustomError(storeList, "IncorrectStoreId");
  });
});
