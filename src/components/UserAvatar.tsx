import React from 'react';
import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material';

interface UserAvatarProps extends Omit<MuiAvatarProps, 'src'> {
  src?: string | null | undefined;
  username?: string;
}

/**
 * Component Avatar tùy chỉnh để xử lý giá trị null và undefined
 * Chuyển đổi src từ (string | null | undefined) sang (string | undefined)
 */
const UserAvatar: React.FC<UserAvatarProps> = ({ src, username, alt, ...rest }) => {
  // Đảm bảo src là string hoặc undefined, không bao giờ là null
  const safeSrc = src || undefined;
  
  // Sử dụng username cho alt nếu alt không được cung cấp
  const safeAlt = alt || username || 'User';
  
  return <MuiAvatar src={safeSrc} alt={safeAlt} {...rest} />;
};

export default UserAvatar; 