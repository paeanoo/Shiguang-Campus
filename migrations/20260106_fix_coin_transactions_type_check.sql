-- Ensure coin_transactions.type check allows both 'gift_redeem' and 'redeem' and common values.
BEGIN;

ALTER TABLE IF EXISTS public.coin_transactions
  DROP CONSTRAINT IF EXISTS coin_transactions_type_check;

ALTER TABLE IF EXISTS public.coin_transactions
  ADD CONSTRAINT coin_transactions_type_check CHECK (type IN ('check_in','task_reward','gift_redeem','redeem','admin_adjust'));

COMMIT;

