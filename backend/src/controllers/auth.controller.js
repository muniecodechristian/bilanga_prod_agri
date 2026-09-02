import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ENV } from "../config/env.js";

// ─── Helper: generate JWT ───────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, { expiresIn: "7d" });
};

// ─── REGISTER ────────────────────────────────────────────────────────────────
// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { email, phone, username, password, firstName, lastName, role } = req.body;

  // Validation : au moins email ou phone
  if (!email && !phone) {
    return res.status(400).json({ error: "Un email ou un numéro de téléphone est requis" });
  }
  if (!username) {
    return res.status(400).json({ error: "Le nom d'utilisateur est requis" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
  }
  if (!role || !["proprietaire", "client"].includes(role)) {
    return res.status(400).json({ error: "Le rôle doit être 'proprietaire' ou 'client'" });
  }

  // Vérifier unicité email / phone / username
  const existingEmail = email ? await User.findOne({ email: email.toLowerCase() }) : null;
  if (existingEmail) {
    return res.status(409).json({ error: "Cet email est déjà utilisé" });
  }

  const existingPhone = phone ? await User.findOne({ phone }) : null;
  if (existingPhone) {
    return res.status(409).json({ error: "Ce numéro de téléphone est déjà utilisé" });
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return res.status(409).json({ error: "Ce nom d'utilisateur est déjà pris" });
  }

  // Créer l'utilisateur (le password sera hashé par le pre-save hook)
  const user = await User.create({
    email: email ? email.toLowerCase() : undefined,
    phone: phone || undefined,
    username,
    password,
    firstName: firstName || "",
    lastName: lastName || "",
    role,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    message: "Compte créé avec succès",
    token,
    user,
  });
});

// ─── LOGIN ───────────────────────────────────────────────────────────────────
// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  // identifier = email OU téléphone OU username

  if (!identifier || !password) {
    return res.status(400).json({ error: "Identifiant et mot de passe requis" });
  }

  // Chercher l'utilisateur par email, téléphone ou username
  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { phone: identifier },
      { username: identifier },
    ],
  }).select("+password");

  if (!user) {
    return res.status(401).json({ error: "Identifiant ou mot de passe incorrect" });
  }

  // Récupérer le password hashé pour comparaison
  const rawUser = await User.findById(user._id).select("+password");
  const isMatch = await rawUser.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ error: "Identifiant ou mot de passe incorrect" });
  }

  const token = generateToken(user._id);

  res.status(200).json({
    message: "Connexion réussie",
    token,
    user,
  });
});

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// JWT est stateless — le client supprime le token côté local
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Déconnexion réussie" });
});

// ─── GET ME (alias pour /users/me) ──────────────────────────────────────────
// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
  res.status(200).json({ user });
});
