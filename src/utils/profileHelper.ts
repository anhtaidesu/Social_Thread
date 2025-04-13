import { User } from '../types';

/**
 * Standardize user profile fields
 * This normalizes inconsistent field names and ensures backward compatibility
 */
export const normalizeUserProfile = (profile: User): User => {
  // Create a copy to avoid modifying the original
  const normalizedProfile = { ...profile };
  
  // Normalize follower counts
  if (normalizedProfile.followerCount === undefined && 
      normalizedProfile.followersCount !== undefined) {
    normalizedProfile.followerCount = normalizedProfile.followersCount;
  } else if (normalizedProfile.followersCount === undefined && 
             normalizedProfile.followerCount !== undefined) {
    normalizedProfile.followersCount = normalizedProfile.followerCount;
  }
  
  // Handle displayName and fullName
  if (normalizedProfile.displayName === undefined && 
      normalizedProfile.fullName !== undefined) {
    normalizedProfile.displayName = normalizedProfile.fullName;
  } else if (normalizedProfile.fullName === undefined && 
             normalizedProfile.displayName !== undefined) {
    normalizedProfile.fullName = normalizedProfile.displayName;
  }
  
  // Ensure profile picture is never undefined (use null instead)
  if (normalizedProfile.profilePicture === undefined) {
    normalizedProfile.profilePicture = null;
  }
  
  // Ensure cover picture is never undefined (use null instead)
  if (normalizedProfile.coverPicture === undefined) {
    normalizedProfile.coverPicture = null;
  }
  
  return normalizedProfile;
};

/**
 * Get follower count from a profile safely
 * Works with both followerCount and followersCount fields
 */
export const getFollowerCount = (profile: User): number => {
  if (profile.followerCount !== undefined) {
    return profile.followerCount;
  }
  if (profile.followersCount !== undefined) {
    return profile.followersCount;
  }
  return 0;
};

/**
 * Get following count from a profile safely
 */
export const getFollowingCount = (profile: User): number => {
  return profile.followingCount || 0;
};

/**
 * Increment follower count on a profile
 * Updates both followerCount and followersCount for consistency
 */
export const incrementFollowerCount = (profile: User): User => {
  const updatedProfile = { ...profile };
  
  if (updatedProfile.followerCount !== undefined) {
    updatedProfile.followerCount += 1;
  } else {
    updatedProfile.followerCount = 1;
  }
  
  if (updatedProfile.followersCount !== undefined) {
    updatedProfile.followersCount += 1;
  } else {
    updatedProfile.followersCount = 1;
  }
  
  return updatedProfile;
};

/**
 * Decrement follower count on a profile
 * Updates both followerCount and followersCount for consistency
 */
export const decrementFollowerCount = (profile: User): User => {
  const updatedProfile = { ...profile };
  
  if (updatedProfile.followerCount !== undefined && updatedProfile.followerCount > 0) {
    updatedProfile.followerCount -= 1;
  } else {
    updatedProfile.followerCount = 0;
  }
  
  if (updatedProfile.followersCount !== undefined && updatedProfile.followersCount > 0) {
    updatedProfile.followersCount -= 1;
  } else {
    updatedProfile.followersCount = 0;
  }
  
  return updatedProfile;
};

export default {
  normalizeUserProfile,
  getFollowerCount,
  getFollowingCount,
  incrementFollowerCount,
  decrementFollowerCount
}; 