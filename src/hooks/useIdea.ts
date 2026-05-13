import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "wagmi/actions";
import { bondingCurveAbi } from "@/lib/contracts/abi";
import { wagmiConfig } from "@/lib/wagmi";

export function useIdea(curveAddress: string | undefined) {
  const { isConnected } = useAccount();

  return useQuery({
    queryKey: ["idea", curveAddress],
    queryFn: async () => {
      if (!curveAddress || !isConnected) return null;

      try {
        const [priceWei, ethRaised, tokensSold, migrated] = await Promise.all([
          readContract(wagmiConfig, {
            address: curveAddress as `0x${string}`,
            abi: bondingCurveAbi,
            functionName: "priceWei",
          }),
          readContract(wagmiConfig, {
            address: curveAddress as `0x${string}`,
            abi: bondingCurveAbi,
            functionName: "ethRaised",
          }),
          readContract(wagmiConfig, {
            address: curveAddress as `0x${string}`,
            abi: bondingCurveAbi,
            functionName: "tokensSold",
          }),
          readContract(wagmiConfig, {
            address: curveAddress as `0x${string}`,
            abi: bondingCurveAbi,
            functionName: "migrated",
          }),
        ]);

        return {
          priceWei: Number(priceWei),
          ethRaised: Number(ethRaised) / 1e18,
          tokensSold: Number(tokensSold) / 1e18,
          migrated: Boolean(migrated),
          progress: Math.min(100, (Number(ethRaised) / 1e15) * 100), // 0.001 ETH = 1e15 wei
        };
      } catch (err) {
        console.error("Error fetching idea:", err);
        return null;
      }
    },
    enabled: !!curveAddress && isConnected,
    refetchInterval: 3000,
  });
}
