# Smart Contract Deployment Instructions

## Contract Overview
The CrowdFundLiteV2 smart contract has been integrated into the application. Before using the app, you need to deploy the contract to Scroll Sepolia testnet.

## Prerequisites
1. **Get Scroll Sepolia ETH**:
   - Visit the Scroll Sepolia Faucet: https://scroll.io/faucet
   - Connect your wallet and request testnet ETH

2. **Deploy the Contract**:
   - Use Remix IDE, Hardhat, or Foundry to deploy the contract
   - Constructor parameters:
     - `_maxGoal`: Maximum goal amount in Wei (e.g., 2000000000000000000 for 2 ETH)
     - `_maxPledge`: Maximum pledge amount in Wei (e.g., 1000000000000000000 for 1 ETH)
     - `_moderationRequired`: Set to `true` for moderated campaigns

## Network Configuration
- **Chain ID**: 534351
- **RPC URL**: https://sepolia-rpc.scroll.io
- **Block Explorer**: https://sepolia.scrollscan.com

## Update Contract Address
After deploying the contract:

1. Open `src/lib/scroll-config.ts`
2. Update the `CONTRACT_ADDRESS` constant with your deployed contract address:

```typescript
export const CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
```

## Contract Functions Available

### Campaign Management
- `createCampaign(goal, durationSeconds, token, maxPledge)` - Create a new campaign
- `cancelCampaign(campaignId)` - Cancel campaign before it starts

### Pledging
- `pledge(campaignId)` - Pledge ETH to a campaign (payable)
- `pledgeERC20(campaignId, amount)` - Pledge ERC20 tokens

### Withdrawals & Refunds
- `withdraw(campaignId)` - Owner withdraws funds if goal reached
- `refund(campaignId)` - Backer claims refund if goal not reached

### Admin Functions (Owner Only)
- `approveCampaign(campaignId)` - Approve a campaign
- `setMaxGoal(amount)` - Update platform max goal
- `setMaxPledge(amount)` - Update platform max pledge
- `setModerationRequired(bool)` - Toggle moderation

## Testing the Integration

1. **Create a Campaign**:
   - Navigate to "Create Campaign" page
   - Fill in the form and submit
   - Confirm the transaction in MetaMask
   - Wait for transaction confirmation

2. **Pledge to Campaign**:
   - Open any active campaign
   - Enter pledge amount
   - Confirm transaction

3. **Check Campaign Status**:
   - View campaign details on-chain
   - Monitor pledges and progress

## Important Notes

- All amounts are in Wei (1 ETH = 1000000000000000000 Wei)
- Native ETH campaigns use `address(0)` as the token address
- Campaign owners can only withdraw if goal is reached and campaign ended
- Backers can only refund if goal not reached and campaign ended
- Gas fees apply to all transactions

## Security Considerations

- The contract uses OpenZeppelin's ReentrancyGuard for security
- All state changes follow checks-effects-interactions pattern
- SafeERC20 is used for token transfers
- Contract is designed for testnet - perform thorough audit before mainnet

## Support

For issues or questions:
1. Check the Scroll Sepolia explorer for transaction status
2. Verify you're connected to the correct network
3. Ensure sufficient ETH for gas fees
4. Check console logs for detailed error messages
