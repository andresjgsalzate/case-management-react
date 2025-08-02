import React from 'react';
import { useUserInfo } from '../hooks/useUserInfo';

interface UserDisplayProps {
  userId: string;
  showEmail?: boolean;
}

export const UserDisplay: React.FC<UserDisplayProps> = ({ 
  userId, 
  showEmail = false 
}) => {
  const { userInfo, loading } = useUserInfo(userId);

  if (loading) {
    return <span className="text-gray-500">Cargando...</span>;
  }

  if (!userInfo) {
    return <span className="text-gray-500">Usuario no encontrado</span>;
  }

  return (
    <span title={showEmail ? userInfo.email : undefined}>
      {userInfo.full_name || userInfo.email}
      {showEmail && userInfo.full_name && (
        <span className="text-gray-500 text-sm ml-1">({userInfo.email})</span>
      )}
    </span>
  );
};
