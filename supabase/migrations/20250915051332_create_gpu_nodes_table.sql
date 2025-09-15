-- Create gpu_nodes table
CREATE TABLE IF NOT EXISTS gpu_nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    api_key TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'error')),
    gpu_info JSONB,
    performance JSONB,
    capabilities TEXT[],
    location TEXT,
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    priority INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE gpu_nodes IS 'Stores information about distributed GPU nodes for processing tasks.';
COMMENT ON COLUMN gpu_nodes.endpoint IS 'The network endpoint of the GPU node.';
COMMENT ON COLUMN gpu_nodes.api_key IS 'API key for authenticating with the node. Should be stored encrypted.';
COMMENT ON COLUMN gpu_nodes.gpu_info IS 'Detailed information about the GPU hardware.';
COMMENT ON COLUMN gpu_nodes.performance IS 'Real-time performance metrics of the node.';
COMMENT ON COLUMN gpu_nodes.last_heartbeat IS 'The last time the node reported its status.';
COMMENT ON COLUMN gpu_nodes.owner_id IS 'The user who registered the node.';


-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gpu_nodes_status ON gpu_nodes(status);
CREATE INDEX IF NOT EXISTS idx_gpu_nodes_location ON gpu_nodes(location);
CREATE INDEX IF NOT EXISTS idx_gpu_nodes_last_heartbeat ON gpu_nodes(last_heartbeat);

-- RLS Policies
ALTER TABLE gpu_nodes ENABLE ROW LEVEL SECURITY;

-- 1. Allow read access for all authenticated users
CREATE POLICY "Allow authenticated users to view GPU nodes"
ON gpu_nodes FOR SELECT
TO authenticated
USING (true);

-- 2. Allow users to insert nodes, setting themselves as owner
CREATE POLICY "Allow users to insert their own GPU nodes"
ON gpu_nodes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- 3. Allow owners to update their own nodes
CREATE POLICY "Allow owners to update their own nodes"
ON gpu_nodes FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

-- 4. Allow owners to delete their own nodes
CREATE POLICY "Allow owners to delete their own nodes"
ON gpu_nodes FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- 5. Allow admin/manager roles to manage all nodes
CREATE POLICY "Allow admins and managers to manage all nodes"
ON gpu_nodes FOR ALL
TO authenticated
USING (
  get_user_role(auth.uid()) IN ('admin', 'manager')
)
WITH CHECK (
  get_user_role(auth.uid()) IN ('admin', 'manager')
);
