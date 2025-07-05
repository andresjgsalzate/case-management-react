import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile, usePermissions } from '@/hooks/useUserProfile';
import { useCases } from '@/hooks/useCases';
import { PageWrapper } from '@/components/PageWrapper';

export const DebugPage: React.FC = () => {
  const { user } = useAuth();
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const { isAdmin, canAccessAdmin } = usePermissions();
  const { data: cases, isLoading: casesLoading, error: casesError } = useCases();

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Debug Information</h1>
      
      {/* Auth User */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Auth User</h2>
        <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
          {JSON.stringify({ 
            id: user?.id,
            email: user?.email,
            user_metadata: user?.user_metadata 
          }, null, 2)}
        </pre>
      </div>

      {/* User Profile */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          User Profile 
          {profileLoading && <span className="text-blue-500 ml-2">(Loading...)</span>}
          {profileError && <span className="text-red-500 ml-2">(Error)</span>}
        </h2>
        {profileError && (
          <div className="text-red-600 mb-4">
            Error: {profileError.message}
          </div>
        )}
        <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
          {JSON.stringify(userProfile, null, 2)}
        </pre>
      </div>

      {/* Permissions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Permissions</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Is Admin: <span className={isAdmin() ? 'text-green-600' : 'text-red-600'}>{isAdmin().toString()}</span></div>
          <div>Can Access Admin: <span className={canAccessAdmin() ? 'text-green-600' : 'text-red-600'}>{canAccessAdmin().toString()}</span></div>
        </div>
      </div>

      {/* Cases */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          Cases 
          {casesLoading && <span className="text-blue-500 ml-2">(Loading...)</span>}
          {casesError && <span className="text-red-500 ml-2">(Error)</span>}
        </h2>
        {casesError && (
          <div className="text-red-600 mb-4">
            Error: {casesError.message}
          </div>
        )}
        <div className="text-sm mb-2">
          Cases Count: {cases?.length || 0}
        </div>
        <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto max-h-64">
          {JSON.stringify(cases?.slice(0, 3) || [], null, 2)}
        </pre>
      </div>
    </PageWrapper>
  );
};
