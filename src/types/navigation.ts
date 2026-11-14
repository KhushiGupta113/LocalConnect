export type AuthStackParamList = {
  Login: undefined;
  Registration: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  CreatePost: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  PostDetails: { postId: string };
  EditProfile: undefined;
};
