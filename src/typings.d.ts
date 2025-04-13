import { PostsState } from './features/posts/postsSlice';
import { AuthState } from './types';
import { NotificationsState } from './features/notifications/notificationsSlice';

declare module 'react-redux' {
  interface DefaultRootState {
    posts: PostsState;
    auth: AuthState;
    notifications: NotificationsState;
  }
} 