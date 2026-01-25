import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FarcasterNFTModule = buildModule("FarcasterNFTModule", (m) => {
  const initialOwner = m.getParameter("initialOwner");

  const farcasterNFT = m.contract("FarcasterNFT", [initialOwner]);

  return { farcasterNFT };
});

export default FarcasterNFTModule;
