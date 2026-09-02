import asyncHandler from "express-async-handler";
import Recolte from "../models/recoltes.models.js";
import cloudinary from "../config/cloudinary.js";

export const createRecoltePost = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "Des images sont requises" });
  }

  // CONVERSION req.files → Base64
  const imagesBase64 = req.files.map((file) => {
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  });

  // ☁️ Upload Cloudinary
  const uploadedImages = await Promise.all(
    imagesBase64.map(async (base64) => {
      const result = await cloudinary.uploader.upload(base64, {
        folder: "recoltes",
      });
      return result.secure_url;
    })
  );

  const recolte = await Recolte.create({
    user: user._id,
    images: uploadedImages,
    title: req.body.title,
    phone: req.body.phone,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    quantity: req.body.quantity,
    city: req.body.city,
    country: req.body.country,
  });

  res.status(201).json({ success: true, recolte });
});

export const getRecoltePosts = asyncHandler(async (req, res) => {
  const recoltes = await Recolte.find()
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture");

  res.status(200).json({ recoltes });
});

export const getMyRecoltePost = asyncHandler(async (req, res) => {
  const user = req.user;

  const recoltes = await Recolte.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture");

  res.status(200).json({ recoltes });
});

export const deleteRecoltePost = asyncHandler(async (req, res) => {
  const user = req.user;
  const { recolteId } = req.params;

  const recolte = await Recolte.findById(recolteId);
  if (!recolte) return res.status(404).json({ error: "Récolte introuvable" });

  if (recolte.user.toString() !== user._id.toString()) {
    return res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres récoltes" });
  }

  await Recolte.findByIdAndDelete(recolteId);

  res.status(200).json({ message: "Récolte supprimée" });
});
