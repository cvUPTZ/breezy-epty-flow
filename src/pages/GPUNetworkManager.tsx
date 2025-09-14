import React from 'react';
import { GPUNetworkManager } from '@/components/admin/GPUNetworkManager';
import { RequireAuth } from '@/components/RequireAuth';

const GPUNetworkManagerPage: React.FC = () => {
  return (
    <RequireAuth>
      <div className="container mx-auto p-6">
        <GPUNetworkManager />
      </div>
    </RequireAuth>
  );
};

export default GPUNetworkManagerPage;