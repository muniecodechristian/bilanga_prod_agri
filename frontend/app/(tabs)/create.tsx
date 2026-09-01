import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Switch,
} from "react-native";

import PhoneInput from "react-native-phone-number-input";
import { CreateStyles as styles } from "@/GlobaleStyles/create";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCreateRecoltePost } from "@/hooks/useCreateRecoltecPost";

export default function CreatePostScreen() {
  const {
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
    loading
  } = useCreateRecoltePost();

  const [phoneValid, setPhoneValid] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7FBF7" }}>
      <Text style={styles.header}>Publier une récolte</Text>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ----- Images ----- */}
        <View style={styles.imageZone}>
          {images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.previewSmall} />
          ))}

          {images.length < 4 && (
            <TouchableOpacity style={styles.addImage} onPress={pickImageFromGallery}>
              <Ionicons name="add-circle-outline" size={36} color="#4CAF50" />
              <Text style={styles.addImageText}>Ajouter</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ----- TOGGLE AUTO / MANUEL ----- */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Utiliser ma position automatique</Text>
          <Switch
            value={autoLocation}
            onValueChange={(val) => setAutoLocation(val)}
            thumbColor={autoLocation ? "#4CAF50" : "#ccc"}
          />
        </View>

        {/* ----- INPUTS ----- */}
        <TextInput
          style={styles.input}
          placeholder="Titre du produit *"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Description *"
          value={description}
          onChangeText={setDescription}
          multiline 
        />
        <View style={styles.phoneContainer}>
          <PhoneInput
            defaultCode="CD" // 🇨🇩 RDC
            layout="first"
            value={phone}
            onChangeFormattedText={(text) => {
              setPhone(text);
              setPhoneValid(text.length > 8); // validation simple
            }}
            containerStyle={styles.phoneInput}
            textContainerStyle={styles.phoneText}
            textInputProps={{
              placeholder: "Numéro (appel ou WhatsApp)",
            }}
          />
        </View>

        {!phoneValid && (
          <Text style={{ color: "red", marginBottom: 8 }}>
            Numéro invalide
          </Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Prix *"
          value={price}
          onChangeText={setPrice}
        />

        <TextInput
          style={styles.input}
          placeholder="Catégorie (ex:tomates, oignons, etc..)"
          value={category}
          onChangeText={setCategory}
        />

        <TextInput
          style={styles.input}
          placeholder="Quantité (optionnel)"
          value={quantity}
          onChangeText={setQuantity}
        />

        {/* ----- AUTO OR MANUAL ADDRESS ----- */}
        <TextInput
          style={[
            styles.input,
            autoLocation && { backgroundColor: "#E9F6EA", opacity: 0.7 },
          ]}
          placeholder="Ville / cité ou village"
          value={city}
          editable={!autoLocation} 
          onChangeText={setCity}
        />

        <TextInput
          style={[
            styles.input,
            autoLocation && { backgroundColor: "#E9F6EA", opacity: 0.7 },
          ]}
          placeholder="Pays"
          value={country}
          editable={!autoLocation}
          onChangeText={setCountry}
        />

        {/* ----- Submit ----- */}
        <TouchableOpacity style={styles.button} onPress={createPost} disabled={!title || !description || !phone || !country || !city || !price || !category}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color="#fff" />
              <Text style={styles.buttonText}>Publier</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
