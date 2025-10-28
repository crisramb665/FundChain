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

## Troubleshooting

### Campaign Creation Button Not Working

If the campaign creation button doesn't trigger a wallet transaction:

1. **Check Wallet Connection**:
   - Ensure MetaMask is installed and unlocked
   - Click "Connect Wallet" in the header
   - Approve the connection request in MetaMask

2. **Verify Network**:
   - You should see a "Switch Network" button if on wrong network
   - Click it to automatically switch to Scroll Sepolia
   - Or manually switch in MetaMask to "Scroll Sepolia Testnet"

3. **Verify Contract Address**:
   - Open `src/lib/scroll-config.ts`
   - Check that `CONTRACT_ADDRESS` is not `0x0000...`
   - Must be your actual deployed contract address

4. **Check Console for Errors**:
   - Open browser DevTools (F12)
   - Look for error messages in the Console tab
   - Common errors:
     - "Contract not deployed" - Update CONTRACT_ADDRESS
     - "Insufficient funds" - Get testnet ETH from faucet
     - "User rejected transaction" - Approve in MetaMask

5. **Test Wallet Connection**:
   - Header should show your shortened address (0x1234...5678)
   - Network indicator should show correct chain
   - If not, disconnect and reconnect wallet

### Transaction Flow

When creating a campaign, you should see:
1. Form validation passes
2. Button changes to "Creating..."
3. MetaMask popup appears requesting transaction approval
4. After approval, transaction is submitted
5. Wait for confirmation (10-30 seconds on testnet)
6. Success message with transaction hash
7. Campaign saved to database with contract ID
8. Redirect to dashboard

### Common Issues

**"Failed to create campaign on blockchain"**
- Contract address not set correctly
- Insufficient gas fees
- Campaign parameters exceed contract limits

**"Please switch to Scroll Sepolia network"**
- Wrong network selected in MetaMask
- Click "Switch Network" button in header

**"Please connect your wallet"**
- No wallet connected
- Click "Connect Wallet" in header

## Support

For issues or questions:
1. Check the Scroll Sepolia explorer for transaction status
2. Verify you're connected to the correct network
3. Ensure sufficient ETH for gas fees
4. Check console logs for detailed error messages
5. Verify CONTRACT_ADDRESS is properly set
