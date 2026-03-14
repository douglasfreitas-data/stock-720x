-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON push_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own subscriptions
CREATE POLICY "Users can insert their own subscriptions"
ON push_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own subscriptions
CREATE POLICY "Users can delete their own subscriptions"
ON push_subscriptions FOR DELETE
USING (auth.uid() = user_id);
