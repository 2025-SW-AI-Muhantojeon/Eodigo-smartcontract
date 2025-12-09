import { Signer } from "ethers"
import { ethers } from "hardhat";
import { 
    Gift,Gift__factory,
    MinimalForwarder,MinimalForwarder__factory, 
    OwnerManager, OwnerManager__factory, 
    StoreList, StoreList__factory, 
    WhiteList, WhiteList__factory
} from "../../typechain-types";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";

/**
 * @TODO
 * 메타 트랜잭션 실패 관련 테스트가 있어야 함
 */
describe("Gift Test", () => {
    let owner: Signer,
        otherAccounts: Signer[],
        ownerManager: OwnerManager,
        storeList: StoreList,
        whiteList: WhiteList,
        forwarder: MinimalForwarder,
        gift: Gift;

    before(async () => {
        [owner, ...otherAccounts] = await ethers.getSigners();

        // 컨트랙트 배포
        forwarder = await new MinimalForwarder__factory(owner).deploy();
        ownerManager = await new OwnerManager__factory(owner).deploy();
        storeList = await new StoreList__factory(owner).deploy(await ownerManager.getAddress());
        whiteList = await new WhiteList__factory(owner).deploy(await ownerManager.getAddress());

        gift = await new Gift__factory(owner).deploy(
            await forwarder.getAddress(),
            await ownerManager.getAddress(),
            await storeList.getAddress(),
            await whiteList.getAddress()
        );

        // 화이트 리스트 등록
        await whiteList.setWhiteList(await otherAccounts[0].getAddress(), true);
        
        await storeList.addStore(1n, await otherAccounts[1].getAddress());
    });
    
    it ("Mint Token To User", async () => {
        // 1만원 발급
        await gift.connect(owner).mint(otherAccounts[0], 10000);
        expect(await gift.expiryDate(otherAccounts[0])).to.equal((await time.latest()) + 180 * 24 * 60 * 60);
    });

    it ("Transfer Token To Store", async () => {
        const amount = 5000n;
        const user = otherAccounts[0];
        const store = otherAccounts[1];
        const relayer = otherAccounts[2];

        // 화이트 리스트 아닐 경우
        await expect(gift.connect(otherAccounts[5])
            .transfer(store, amount))
            .to.be.revertedWith("address is not whiteList");

        // EIP-712 타입 정의 (서명용 - nonce 포함, signature 제외)
        const types = {
            ForwardRequest: [
                { name: "from", type: "address" },
                { name: "to", type: "address" },
                { name: "value", type: "uint256" },
                { name: "gas", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint48" },
                { name: "data", type: "bytes" }
            ]
        };

        const domain = {
            name: "EodigoMinimalForwarder",
            version: "1",
            chainId: (await ethers.provider.getNetwork()).chainId,
            verifyingContract: await forwarder.getAddress()
        };

        // 1. nonce 가져오기
        const nonce = await forwarder.nonces(await user.getAddress());

        // 2. 서명할 메시지 (nonce 포함, signature 제외)
        const message = {
            from: await user.getAddress(),
            to: await gift.getAddress(),
            value: 0,
            gas: 1000000,
            nonce: nonce,
            deadline: Math.floor(Date.now() / 1000) + 3600,
            data: gift.interface.encodeFunctionData("transfer", [
                await store.getAddress(),
                amount
            ])
        };

        // 3. 서명 생성
        const signature = await user.signTypedData(domain, types, message);

        // 4. ForwardRequestData 구성 (signature 포함!)
        const forwardRequest = {
            from: await user.getAddress(),
            to: await gift.getAddress(),
            value: 0,
            gas: 1000000,
            deadline: Math.floor(Date.now() / 1000) + 3600,
            data: gift.interface.encodeFunctionData("transfer", [
                await store.getAddress(),
                amount
            ]),
            signature: signature
        };

        // 5. 릴레이어가 실행
        const tx = await forwarder.connect(relayer).execute(forwardRequest);
        await tx.wait();

        // 6. 검증
        expect(await gift.balanceOf(await user.getAddress())).to.equal(amount);
        expect(await gift.balanceOf(await store.getAddress())).to.equal(amount);
    });

    it ("Settlement", async () => {
        const user = otherAccounts[0];
        const store = otherAccounts[1];
        const relayer = otherAccounts[2];
        const settlementAmount = 5000n;
        
        const types = {
            ForwardRequest: [
                { name: "from", type: "address" },
                { name: "to", type: "address" },
                { name: "value", type: "uint256" },
                { name: "gas", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint48" },
                { name: "data", type: "bytes" }
            ]
        };

        const domain = {
            name: "EodigoMinimalForwarder",
            version: "1",
            chainId: (await ethers.provider.getNetwork()).chainId,
            verifyingContract: await forwarder.getAddress()
        };

        const nonce = await forwarder.nonces(await store.getAddress());

        const message = {
            from: await store.getAddress(),
            to: await gift.getAddress(),
            value: 0,
            gas: 1000000,
            nonce: nonce,
            deadline: Math.floor(Date.now() / 1000) + 3600,
            data: gift.interface.encodeFunctionData("settlement", [
                settlementAmount
            ])
        };

        const signature = await store.signTypedData(domain, types, message);

        const forwardRequest = {
            from: await store.getAddress(),
            to: await gift.getAddress(),
            value: 0,
            gas: 1000000,
            deadline: Math.floor(Date.now() / 1000) + 3600,
            data: gift.interface.encodeFunctionData("settlement", [
                settlementAmount
            ]),
            signature: signature
        };

        await expect(forwarder.connect(relayer).execute(forwardRequest))
            .to.emit(gift, "CashOut")
            .withArgs(1n, settlementAmount);

        expect(await gift.balanceOf(await store.getAddress())).to.equal(0n);
    });

    it ("CashExpiredCheck", async () => {

    });

})