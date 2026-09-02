import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ENV } from "../config/env.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Non autorisé - token manquant" });
    }

    const token = authHeader.split(" ")[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Non autorisé - utilisateur introuvable" });
    }

    // Injecter l'utilisateur dans la requête
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Non autorisé - token invalide" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Non autorisé - token expiré" });
    }
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
