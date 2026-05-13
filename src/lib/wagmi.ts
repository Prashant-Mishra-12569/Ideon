import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo";

export const wagmiConfig = getDefaultConfig({
  appName: "Ideon",
  projectId,
  chains: [baseSepolia],
  ssr: true,
});

export const ACTIVE_CHAIN = baseSepolia;
