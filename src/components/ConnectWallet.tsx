import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { NeonButton } from "./NeonButton";
import { cn } from "@/lib/utils";

export function ConnectWallet({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <NeonButton size={size} onClick={openConnectModal}>
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">Connect</span>
                  </NeonButton>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="rounded-full bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-300 ring-1 ring-red-400/40"
                  >
                    Wrong network
                  </button>
                );
              }
              return (
                <button
                  onClick={openAccountModal}
                  className={cn(
                    "glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-mono text-white",
                    "ring-1 ring-white/10 hover:ring-white/25 transition",
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />
                  <span>{account.displayName}</span>
                  {account.displayBalance && (
                    <span className="hidden text-foreground/60 sm:inline">· {account.displayBalance}</span>
                  )}
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
