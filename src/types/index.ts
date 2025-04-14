export interface User {
  id: string;
  userId?: string; 
  username: string;
  displayName?: string;
  fullName?: string; // For backward compatibility
  bio?: string;
  profilePicture?: string | null;
  coverPicture?: string | null;
  isVerified?: boolean;
  followerCount?: number;
  followingCount?: number;
  followersCount?: number; // For backward compatibility
  postCount?: number;
  lastActive?: string;
  createdAt: string;
  updatedAt?: string;
  
  // Thông tin bổ sung có thể có từ API profile
  email?: string;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  website?: string;
  location?: string;
  isPrivate?: boolean;
  deletedAt?: string | null;
}

export interface Post {
  id: string;
  profileId?: string;
  content: string;
  author?: User;
  profile?: User;
  
  // Frontend properties (existing code)
  images?: string[];
  likesCount?: number;
  commentsCount?: number;
  repostsCount?: number;
  
  // Backend properties (from API)
  mediaUrls?: string | string[];
  likeCount?: number;
  commentCount?: number;
  repostCount?: number;
  parentId?: string;
  rootThreadId?: string;
  threadPosition?: number;
  isRepost?: boolean;
  originalPostId?: string;
  tags?: string | string[];
  mentions?: string | string[];
  isPublic?: boolean;
  privacy?: 'public' | 'private' | 'followers';
  
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  author?: User;
  profile?: User;
  profileId?: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string;
  isDeleted?: boolean;
  userId?: string;
  // Fields for ownership check (already added above)
  
  // Fields for likes
  likes?: number;
  likeCount?: number;
  isLiked?: boolean;
  
  // Fields for replies
  replies?: Comment[];
  repliesCount?: number;
  
  // Legacy field - keep for compatibility
  post?: string; // Post ID (legacy)
}

export interface Notification {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'REPOST' | 'MENTION' | 'FOLLOW_REQUEST' | 'FOLLOW_APPROVED' | 'SYSTEM';
  entityType: 'POST' | 'COMMENT' | 'PROFILE' | 'SYSTEM';
  entityId?: string;
  sender: User;
  message: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
  
  // Các trường cũ giữ lại để tương thích ngược
  receiver?: string; // User ID
  post?: string; // Post ID
  comment?: string; // Comment ID
  read?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  otpEmail: string | null;
}

export interface ErrorResponse {
  message: string;
  status: number;
} 