// Minimal ABIs matching contracts/IdeaFactory.sol, BondingCurve.sol, IdeaToken.sol.

export const ideaFactoryAbi = [
  {
    type: "function",
    name: "createIdea",
    stateMutability: "payable",
    inputs: [
      { name: "name_", type: "string" },
      { name: "symbol_", type: "string" },
      { name: "metadataCID", type: "string" },
    ],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "curve", type: "address" },
      { name: "token", type: "address" },
    ],
  },
  { type: "function", name: "creationFee", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "ideasCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function",
    name: "getAllIdeas",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "curve", type: "address" },
          { name: "token", type: "address" },
          { name: "creator", type: "address" },
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "metadataCID", type: "string" },
          { name: "createdAt", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getIdea",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "curve", type: "address" },
          { name: "token", type: "address" },
          { name: "creator", type: "address" },
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "metadataCID", type: "string" },
          { name: "createdAt", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "event",
    name: "IdeaCreated",
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "curve", type: "address" },
      { indexed: false, name: "token", type: "address" },
      { indexed: false, name: "name", type: "string" },
      { indexed: false, name: "symbol", type: "string" },
      { indexed: false, name: "metadataCID", type: "string" },
    ],
  },
] as const;

export const bondingCurveAbi = [
  { type: "function", name: "token", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "creator", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "ethRaised", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "tokensSold", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "migrated", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "priceWei", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function",
    name: "quoteBuy",
    stateMutability: "view",
    inputs: [{ name: "ethIn", type: "uint256" }],
    outputs: [{ name: "tokensOut", type: "uint256" }, { name: "fee", type: "uint256" }],
  },
  {
    type: "function",
    name: "quoteSell",
    stateMutability: "view",
    inputs: [{ name: "tokensIn", type: "uint256" }],
    outputs: [{ name: "ethOut", type: "uint256" }, { name: "fee", type: "uint256" }],
  },
  {
    type: "function",
    name: "buy",
    stateMutability: "payable",
    inputs: [{ name: "minTokensOut", type: "uint256" }],
    outputs: [{ name: "tokensOut", type: "uint256" }],
  },
  {
    type: "function",
    name: "sell",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokensIn", type: "uint256" }, { name: "minEthOut", type: "uint256" }],
    outputs: [{ name: "ethOut", type: "uint256" }],
  },
  {
    type: "event",
    name: "Buy",
    inputs: [
      { indexed: true, name: "buyer", type: "address" },
      { indexed: false, name: "ethIn", type: "uint256" },
      { indexed: false, name: "fee", type: "uint256" },
      { indexed: false, name: "tokensOut", type: "uint256" },
      { indexed: false, name: "ethRaised", type: "uint256" },
      { indexed: false, name: "tokensSold", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "Sell",
    inputs: [
      { indexed: true, name: "seller", type: "address" },
      { indexed: false, name: "tokensIn", type: "uint256" },
      { indexed: false, name: "ethOut", type: "uint256" },
      { indexed: false, name: "fee", type: "uint256" },
      { indexed: false, name: "ethRaised", type: "uint256" },
      { indexed: false, name: "tokensSold", type: "uint256" },
    ],
  },
] as const;

export const ideaTokenAbi = [
  { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "value", type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;
