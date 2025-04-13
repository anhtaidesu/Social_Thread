import React from 'react';
import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material';
import { User } from '../types';

interface UserAvatarProps extends Omit<MuiAvatarProps, 'src'> {
  src?: string | null | undefined;
  username?: string;
  user?: User;
  size?: number;
}

/**
 * Component Avatar tùy chỉnh để xử lý giá trị null và undefined
 * Chuyển đổi src từ (string | null | undefined) sang (string | undefined)
 */
const UserAvatar: React.FC<UserAvatarProps> = ({ src, username, alt, user, size, ...rest }) => {
  // Sử dụng thông tin từ đối tượng user nếu được cung cấp
  const userSrc = user?.profilePicture || src;
  const userUsername = user?.username || username;
  
  // Đảm bảo src là string hoặc undefined, không bao giờ là null
  const safeSrc = userSrc || undefined;
  
  // Sử dụng username cho alt nếu alt không được cung cấp
  const safeAlt = alt || userUsername || 'User';
  
  // Áp dụng kích thước nếu được cung cấp
  const sizeProps = size ? { sx: { width: size, height: size, ...rest.sx } } : {};
  
  return <MuiAvatar src={safeSrc} alt={safeAlt} {...rest} {...sizeProps} />;
};

export default UserAvatar; 