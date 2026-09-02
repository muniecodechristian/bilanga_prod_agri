import asyncHandler from "express-async-handler";
import Notification from "../models/notification.model.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification.find({ to: userId })
    .sort({ createdAt: -1 })
    .populate("from", "username firstName lastName profilePicture")
    .populate("post", "content image")
    .populate("comment", "content");

  res.status(200).json({ notifications });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    to: userId,
  });

  if (!notification) return res.status(404).json({ error: "Notification introuvable" });

  res.status(200).json({ message: "Notification supprimée" });
});
