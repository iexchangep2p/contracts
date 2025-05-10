import { DiamondLoupeFacet } from "./../typechain-types/contracts/diamond/facets/DiamondLoupeFacet";
import { ethers, ignition } from "hardhat";
import { expect } from "chai";
import IgniteTestModule from "../ignition/modules/test/IgniteTest";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {
    FacetCutAction,
  findAddressWithAllSignatures,
  functionSelectors,
  functionSigs,
  functionSigsSelectors,
} from "../ignition/lib";
import { diamond } from "../typechain-types/contracts";

describe("Diamond", async function () {
  async function deployDiamond() {
    const {
      iExchangeP2P,
      orderProxy,
      orderSigProxy,
      appealProxy,
      managerProxy,
      viewProxy,
      cutProxy
    } = await ignition.deploy(IgniteTestModule);

    const [owner, user] = await ethers.getSigners();
    const diamondLoupeFacet = await ethers.getContractAt(
      "DiamondLoupeFacet",
      await iExchangeP2P.getAddress()
    );

    const facetAddresses = await diamondLoupeFacet.facetAddresses();
    return {
      iExchangeP2P,
      orderProxy,
      orderSigProxy,
      appealProxy,
      managerProxy,
      viewProxy,
      cutProxy,
      diamondLoupeFacet,
      facetAddresses,
      owner,
      user,
    };
  }

  it("Should return total facet addresses", async function () {
    const { facetAddresses } = await loadFixture(deployDiamond);
    facetAddresses.forEach((address, i) => console.log(`${i}. ${address}`));
    expect(facetAddresses.length).to.equal(9);
  });

  it("Should have the right function selectors", async function () {
    const { diamondLoupeFacet, facetAddresses } = await loadFixture(
      deployDiamond
    );
    const facets = await diamondLoupeFacet.facets();
    //DiamondCut
    let results;
    let selectors = functionSelectors("DiamondCutFacet");
    let sigSelectors = functionSigsSelectors("DiamondCutFacet");
    const diamondCutAddress = findAddressWithAllSignatures(
      sigSelectors,
      facets
    );

    if (diamondCutAddress) {
      results = await diamondLoupeFacet.facetFunctionSelectors(
        diamondCutAddress
      );
    } else {
      throw new Error("address is null");
    }
    expect(results).to.deep.equal(selectors);
    console.log("DiamondCut: ", diamondCutAddress, sigSelectors);

    //DiamondLoupe
    selectors = functionSelectors("DiamondLoupeFacet");
    sigSelectors = functionSigsSelectors("DiamondLoupeFacet");
    const diamondLoupeAddress = findAddressWithAllSignatures(
      sigSelectors,
      facets
    );

    if (diamondLoupeAddress) {
      results = await diamondLoupeFacet.facetFunctionSelectors(
        diamondLoupeAddress
      );
    } else {
      throw new Error("address is null");
    }
    expect(results).to.deep.equal(selectors);
    console.log("DiamondLoupe: ", diamondLoupeAddress, sigSelectors);

    //Ownership
    selectors = functionSelectors("OwnershipFacet");
    sigSelectors = functionSigsSelectors("OwnershipFacet");
    const ownershipAddress = findAddressWithAllSignatures(sigSelectors, facets);

    if (ownershipAddress) {
      results = await diamondLoupeFacet.facetFunctionSelectors(
        ownershipAddress
      );
    } else {
      throw new Error("address is null");
    }
    expect(results).to.deep.equal(selectors);
    console.log("Ownership: ", ownershipAddress, sigSelectors);

    //Order
    selectors = functionSelectors("Order");
    sigSelectors = functionSigsSelectors("Order");
    const orderAddress = findAddressWithAllSignatures(sigSelectors, facets);

    if (orderAddress) {
      results = await diamondLoupeFacet.facetFunctionSelectors(orderAddress);
    } else {
      throw new Error("address is null");
    }
    expect(results).to.deep.equal(selectors);
    console.log("order: ", orderAddress, selectors);

    //OrderSig
    selectors = functionSelectors("OrderSig");
    sigSelectors = functionSigsSelectors("OrderSig");
    const orderSigAddress = findAddressWithAllSignatures(sigSelectors, facets);

    if (orderSigAddress) {
      results = await diamondLoupeFacet.facetFunctionSelectors(orderSigAddress);
    } else {
      throw new Error("address is null");
    }
    expect(results).to.deep.equal(selectors);
    console.log("OrderSig: ", orderSigAddress, sigSelectors);
    //Appeal
    selectors = functionSelectors("Appeal");
    sigSelectors = functionSigsSelectors("Appeal");
    const appealAddress = findAddressWithAllSignatures(sigSelectors, facets);

    if (appealAddress) {
      results = await diamondLoupeFacet.facetFunctionSelectors(appealAddress);
    } else {
      throw new Error("address is null");
    }
    expect(results).to.deep.equal(selectors);
      console.log("Appeal: ", appealAddress, sigSelectors);

    //ExchangeManager
    selectors = functionSelectors("ExchangeManager");
    sigSelectors = functionSigsSelectors("ExchangeManager");
    const managerAddress = findAddressWithAllSignatures(sigSelectors, facets);

    if (managerAddress) {
      results = await diamondLoupeFacet.facetFunctionSelectors(managerAddress);
    } else {
      throw new Error("address is null");
    }
    expect(results).to.deep.equal(selectors);
      console.log("ExchangeManager: ", managerAddress, sigSelectors);
    //ExchangeView
    selectors = functionSelectors("ExchangeView");
    sigSelectors = functionSigsSelectors("ExchangeView");
    const viewAddress = findAddressWithAllSignatures(sigSelectors, facets);

    if (viewAddress) {
      results = await diamondLoupeFacet.facetFunctionSelectors(viewAddress);
    } else {
      throw new Error("address is null");
    }
    expect(results).to.deep.equal(selectors);
      console.log("ExchangeView: ", viewAddress, sigSelectors);
  });

  it("Selectors should be associated to facets correctly", async function () {
    const { diamondLoupeFacet, facetAddresses } = await loadFixture(
      deployDiamond
    );
    //DiamondCut - [0] - 0x1f931c1c
    expect(facetAddresses[0]).to.equal(
      await diamondLoupeFacet.facetAddress("0x1f931c1c")
    );
    //DiamondLoupe - [8] - 0xcdffacc6, 0x52ef6b2c
    expect(facetAddresses[8]).to.equal(
      await diamondLoupeFacet.facetAddress("0xcdffacc6")
    );
    //ownership - [7] - 0x8da5cb5b, 0xf2fde38b
    expect(facetAddresses[7]).to.equal(
      await diamondLoupeFacet.facetAddress("0x8da5cb5b")
    );
    //Order - [2] - 0xdfc86408, 0x7489ec23
    expect(facetAddresses[2]).to.equal(
      await diamondLoupeFacet.facetAddress("0x7489ec23")
    );
    //OrderSig - [6] - 0x70a18b1a, 0x189df3a0
    expect(facetAddresses[6]).to.equal(
      await diamondLoupeFacet.facetAddress("0x70a18b1a")
    );
    //Appeal - [3] - 0xfc5644a1, 0x2c600b30
    expect(facetAddresses[3]).to.equal(
      await diamondLoupeFacet.facetAddress("0xfc5644a1")
    );
    //ExchangeManager - [4] - 0x68bf9f9b, 0x8fadeee8
      expect(facetAddresses[4]).to.equal(
        await diamondLoupeFacet.facetAddress("0x68bf9f9b")
      );

    //ExchangView - [5] - 0xece1de44, 0xa087a857
      expect(facetAddresses[5]).to.equal(
        await diamondLoupeFacet.facetAddress("0xece1de44")
      );
  });

  it("Should replace mock getNumber() function", async function () {
    const { cutProxy, iExchangeP2P, owner, user } = await loadFixture(deployDiamond);
    const MockFacet = await ethers.getContractFactory("MockFacet");
    const mockFacet = await MockFacet.deploy();
    
    await mockFacet.setNumber(100);
    expect(await mockFacet.getNumber()).to.equal(100);
    
    const addSelectors = functionSelectors("MockFacet");
    await cutProxy.diamondCut(
      [
        {
          facetAddress: await mockFacet.getAddress(),
          action: FacetCutAction.Add,
          functionSelectors: addSelectors,
        },
      ],
      ethers.ZeroAddress,
      "0x"
    );

    const MockFacetV2 = await ethers.getContractFactory("MockFacetV2");
    const mockFacetV2 = await MockFacetV2.deploy();

    //filter getNumber() - 0xf2c9ecd8
    const replaceSelectors = functionSelectors("MockFacetV2").filter(
      (sig) => sig === "0xf2c9ecd8"
    );

    const cut = [
      {
        facetAddress: await mockFacetV2.getAddress(),
        action: FacetCutAction.Replace,
        functionSelectors: replaceSelectors,
      },
    ];

    // non-owner cannot replace
    await expect(
      (cutProxy.connect(user) as any).diamondCut(cut, ethers.ZeroAddress, "0x")
    ).to.be.revertedWith("LibDiamond: Must be contract owner");

    // owner does the replace
    await cutProxy.diamondCut(cut, ethers.ZeroAddress, "0x");

    // cannot replace it a second time
    await expect(
      (cutProxy.connect(owner) as any).diamondCut(cut, ethers.ZeroAddress, "0x")
    ).to.be.revertedWith(
      "LibDiamondCut: Can't replace function with same function"
    );

    //Verify that the new implementation
    const replacedMockFacet = await ethers.getContractAt(
      "MockFacet",
      await iExchangeP2P.getAddress()
    );
    await replacedMockFacet.setNumber(100);
    expect(await replacedMockFacet.getNumber()).to.equal(42);

    //MockFacetV2
    await expect(mockFacetV2.setNumber(10)).to.not.be.reverted;
    const response = await mockFacetV2.supportsInterface("0x01ffc9a7");
    expect(response).to.equal("0x01ffc9a7");
  });

  it("Should return true for supportsInterface", async function () {
    const { diamondLoupeFacet } = await deployDiamond();
    const IERC165_ID = "0x01ffc9a7";
    expect(await diamondLoupeFacet.supportsInterface(IERC165_ID)).to.equal(
      true
    );

    const UNKNOWN_ID = "0xf2c9ecd8";
    expect(await diamondLoupeFacet.supportsInterface(UNKNOWN_ID)).to.equal(
      false
    );
  });
});
