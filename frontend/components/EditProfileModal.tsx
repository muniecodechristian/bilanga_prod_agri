import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  formData: {
    firstName: string;
    lastName: string;
    bio: string;
    location: string;
  };
  saveProfile: () => void;
  updateFormField: (field: string, value: string) => void;
  isUpdating: boolean;
}

const EditProfileModal = ({
  formData,
  isUpdating,
  isVisible,
  onClose,
  saveProfile,
  updateFormField,
}: EditProfileModalProps) => {
  const handleSave = () => {
    saveProfile();
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Modifier le profil</Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isUpdating}
          style={isUpdating ? styles.disabledButton : undefined}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={GREEN} />
          ) : (
            <Text style={styles.saveText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.container}>
        <View style={styles.formGroup}>
          {/* Prénom */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(text) => updateFormField("firstName", text)}
              placeholder="Entrez votre prénom"
            />
          </View>

          {/* Nom */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(text) => updateFormField("lastName", text)}
              placeholder="Entrez votre nom"
            />
          </View>

          {/* Bio */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => updateFormField("bio", text)}
              placeholder="Parlez un peu de vous"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Localisation */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Localisation</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => updateFormField("location", text)}
              placeholder="Où habitez-vous ?"
            />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default EditProfileModal;

const GREEN = "#2ecc71";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },

  cancelText: {
    color: GREEN,
    fontSize: 17,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  saveText: {
    color: GREEN,
    fontSize: 17,
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.5,
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },

  formGroup: {
    gap: 20,
  },

  inputBlock: {
    marginBottom: 4,
  },

  label: {
    color: GREEN,
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },

  textArea: {
    height: 90,
  },
});
