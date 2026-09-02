import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

// GET /api/users/profile/:username — public
export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
  res.status(200).json({ user });
});

// GET /api/users/me — protégée
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
  res.status(200).json({ user });
});

// PUT /api/users/profile — protégée
export const updateProfile = asyncHandler(async (req, res) => {
  // Champs autorisés à modifier (pas le password ni le role par ici)
  const { firstName, lastName, bio, location, profilePicture, bannerImage } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { firstName, lastName, bio, location, profilePicture, bannerImage },
    { new: true, runValidators: true }
  );

  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  res.status(200).json({ user });
});

// POST /api/users/follow/:targetUserId — protégée
export const followUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id.toString();
  const { targetUserId } = req.params;

  if (currentUserId === targetUserId) {
    return res.status(400).json({ error: "Vous ne pouvez pas vous suivre vous-même" });
  }

  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  if (!currentUser || !targetUser) {
    return res.status(404).json({ error: "Utilisateur introuvable" });
  }

  const isFollowing = currentUser.following.includes(targetUserId);

  if (isFollowing) {
    // Unfollow
    await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
    await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
  } else {
    // Follow
    await User.findByIdAndUpdate(currentUserId, { $push: { following: targetUserId } });
    await User.findByIdAndUpdate(targetUserId, { $push: { followers: currentUserId } });

    // Créer une notification
    await Notification.create({
      from: currentUserId,
      to: targetUserId,
      type: "follow",
    });
  }

  res.status(200).json({
    message: isFollowing ? "Utilisateur désabonné" : "Utilisateur suivi",
  });
});
