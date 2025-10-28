/*
  # Add Smart Contract Integration Fields

  1. Changes
    - Add `contract_id` to campaigns table (stores the on-chain campaign ID)
    - Add `contract_address` to campaigns table (stores owner's wallet address from contract)
    - Add index on contract_id for faster lookups

  2. Notes
    - contract_id will be set after successful on-chain campaign creation
    - Existing campaigns will have NULL contract_id (legacy/demo campaigns)
*/

-- Add contract_id column to campaigns table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'contract_id'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN contract_id integer;
  END IF;
END $$;

-- Add contract_address column to campaigns table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'contract_address'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN contract_address text;
  END IF;
END $$;

-- Add index for faster contract_id lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'campaigns' AND indexname = 'idx_campaigns_contract_id'
  ) THEN
    CREATE INDEX idx_campaigns_contract_id ON campaigns(contract_id);
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN campaigns.contract_id IS 'On-chain campaign ID from CrowdFundLiteV2 smart contract';
COMMENT ON COLUMN campaigns.contract_address IS 'Wallet address of campaign owner from smart contract';
