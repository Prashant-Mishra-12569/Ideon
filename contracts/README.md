# Ideon Smart Contracts (Base Sepolia)

Three contracts power Ideon:

| File | Purpose |
|---|---|
| `IdeaToken.sol` | Minimal fixed-supply ERC-20 (800M, 18 decimals). Entire supply is minted to its `BondingCurve`. |
| `BondingCurve.sol` | Pump.fun-style constant-product curve with virtual reserves (`1.6 ETH` + `800M tokens`), 1% fee, migration trigger at `16 ETH` raised. |
| `IdeaFactory.sol` | Deploys a curve + token per idea and tracks them on-chain. Stores only the IPFS CID for metadata. |

## Deploy with Remix

1. Open https://remix.ethereum.org and create the three files above (paste the contents from `contracts/`).
2. Compile with Solidity `0.8.24` (optimizer on, 200 runs).
3. In **Deploy & Run**:
   - Environment: **Injected Provider — MetaMask**
   - Network: **Base Sepolia** (chainId `84532`)
   - Get test ETH: https://www.alchemy.com/faucets/base-sepolia
4. Deploy `IdeaFactory` with constructor args:
   - `_feeRecipient`: your wallet address
   - `_creationFee`: `0` (or e.g. `1000000000000000` = 0.001 ETH)
5. Copy the deployed `IdeaFactory` address.
6. Paste it into `src/lib/contracts/addresses.ts` → `ADDRESSES.IdeaFactory`.

## Deploy with Foundry (optional)

```bash
forge create contracts/IdeaFactory.sol:IdeaFactory \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --constructor-args $YOUR_WALLET 0
```

## Notes

- `BondingCurve.migrate(to)` is callable by `feeRecipient` only after the
  16 ETH threshold is hit. It transfers all remaining ETH + tokens to `to`
  so you can seed a Uniswap V2/V3 pool on Base Sepolia.
- Frontend ABIs live in `src/lib/contracts/abi.ts`. They are minimal — only
  the functions/events the UI calls.
