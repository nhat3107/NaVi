import User from "../models/User.js";


export const createUser = async (userData) => {
  const user = await User.create(userData);
  return user;
}

export const getUserByEmail = async (email) => {
  const user = await User.findOne(
      {email} ,{
        id:true,
        username:true,
        email:true,
        passwordHash:true,
        googleId:true,
        githubId:true,
        authMethods:true,
        isEmailVerified:true,
        gender:true,
        dateOfBirth:true,
        avatarUrl:true,
        bio:true,
        isOnBoarded:true,
        followers:true,
        following:true,
        settings:true,
    }).lean();
  return user;
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId, {
    id:true,
    username:true,
    email:true,
    passwordHash:true,
    googleId:true,
    githubId:true,
    authMethods:true,
    isEmailVerified:true,
    gender:true,
    dateOfBirth:true,
    avatarUrl:true,
    bio:true,
    isOnBoarded:true,
    followers:true,
    following:true,
    settings:true,
  }).lean();
  return user;
};

export const updateUser = async (userId, profileData) => {
  const user = await User.findByIdAndUpdate(userId, profileData, {new: true});
  return user;
};

export const getUserByUsername = async (username) => {
  const user = await User.findOne({username}, {id:true, username:true});
  return user;
};

// Google OAuth functions
export const getUserByGoogleId = async (googleId) => {
  const user = await User.findOne({ googleId }, {
    id:true,
    username:true,
    email:true,
    googleId:true,
    githubId:true,
    authMethods:true,
    isEmailVerified:true,
    gender:true,
    dateOfBirth:true,
    avatarUrl:true,
    bio:true,
    isOnBoarded:true,
    followers:true,
    following:true,
    settings:true,
  }).lean();
  return user;
};

export const linkGoogleAccount = async (userId, googleId) => {
  const user = await User.findByIdAndUpdate(userId, {
    googleId: googleId,
    $addToSet: { authMethods: 'google' },
    isEmailVerified: true
  }, { new: true });
  return user;
};

// GitHub OAuth functions
export const getUserByGithubId = async (githubId) => {
  const user = await User.findOne({ githubId }, {
    id:true,
    username:true,
    email:true,
    googleId:true,
    githubId:true,
    authMethods:true,
    isEmailVerified:true,
    gender:true,
    dateOfBirth:true,
    avatarUrl:true,
    bio:true,
    isOnBoarded:true,
    followers:true,
    following:true,
    settings:true,
  }).lean();
  return user;
};

export const linkGithubAccount = async (userId, githubId) => {
  const user = await User.findByIdAndUpdate(userId, {
    githubId: githubId,
    $addToSet: { authMethods: 'github' },
    isEmailVerified: true
  }, { new: true });
  return user;
};
