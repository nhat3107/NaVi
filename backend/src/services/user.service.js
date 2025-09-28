import User from "../models/User.js";


export const createUser = async ({email, passwordHash}) => {
  const user = await User.create({email, passwordHash});
  return user;
}

export const getUserByEmail = async (email) => {
  const user = await User.findOne(
      {email} ,{
        id:true,
        username:true,
        email:true,
        passwordHash:true,
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
