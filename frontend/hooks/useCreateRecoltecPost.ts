import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useAuthContext } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

const API_BASE_URL = "https://bilanga-app-backend2.vercel.app/api/recoltes";

export function useCreateRecoltePost() {
  const { user, token } = useAuthContext();
  const queryClient = useQueryClient();

  // ---------------- STATES ----------------
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [autoLocation, setAutoLocation] = useState(false);

  // ---------------- AUTO GPS ----------------
  useEffect(() => {
    if (!autoLocation) return;

    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync(loc.coords);

      if (geo[0]) {
        setCity(geo[0].city || "");
        setCountry(geo[0].country || "");
      }
    })();
  }, [autoLocation]);

  // ---------------- PICK IMAGE ----------------
  const pickImageFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing:true
    });

    if (!res.canceled) {
      setImages((prev) => [...prev, res.assets[0].uri]);
    }
  };

  // ---------------- TAKE PHOTO ----------------
  const takePhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing:true
    });

    if (!res.canceled) {
      setImages((prev) => [...prev, res.assets[0].uri]);
    }
  };

  // ----------------------------------------------------------
  // 🟢 MUTATION : FORM DATA (req.files)
  // ----------------------------------------------------------
  const mutation = useMutation({
    mutationFn: async () => {
      // Use token from context

      const formData = new FormData();

      // ✅ images → req.files
      images.forEach((uri, index) => {
        formData.append("images", {
          uri,
          name: `image_${index}.jpg`,
          type: "image/jpeg",
        } as any);
      });

      // ✅ champs texte
      formData.append("title", title);
      formData.append("description", description);
      formData.append("phone", phone);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("quantity", quantity);
      formData.append("city", city);
      formData.append("country", country);

      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ surtout PAS Content-Type ici
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Erreur lors de la création");
      }

      return json;
      setImages([]);
      setTitle("");
      setDescription("");
      setPhone("");
      setPrice("");
      setCategory("");
      setQuantity("");
      setCity("");
      setCountry("");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recoltes"] });
      Alert.alert("Votre récolte a été ajoutée !");
    },

    onError: (err) => {
      console.log("Erreur création récolte :", err);
        Alert.alert("Erreur lors de la publication");
    },
  });

  // ---------------- CREATE POST ----------------
  const createPost = () => {
    if (!user) {
      alert("Vous devez être connecté");
      return;
    }

    if (images.length === 0) {
      alert("Ajoutez au moins une image");
      return;
    }

    mutation.mutate();
  };

  // ---------------- RETURN ----------------
  return {
    title,
    setTitle,
    description,
    setDescription,
    phone,
    setPhone,
    country,
    setCountry,
    city,
    setCity,
    price,
    setPrice,
    category,
    setCategory,
    quantity,
    setQuantity,
    images,

    autoLocation,
    setAutoLocation,

    createPost,
    pickImageFromGallery,
    takePhoto,

    loading: mutation.isPending,
  };
}
