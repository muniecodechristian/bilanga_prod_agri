import { StyleSheet } from "react-native";

export const CreateStyles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 70,
  },

  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#163916",
    textAlign: "center",
    marginBottom: 14,
  },

  imageZone: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 10,
  },

  previewSmall: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#ccc",
  },

  addImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#E9F6EA",
    justifyContent: "center",
    alignItems: "center",
  },

  addImageText: {
    marginTop: 4,
    fontSize: 12,
    color: "#163916",
    fontWeight: "600",
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  toggleLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#163916",
    width: "75%",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 12,
    fontSize: 15,
    elevation: 1,
  },

  button: {
    backgroundColor: "#4CAF50",
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
    marginLeft: 10,
    fontSize: 16,
  },

  phoneContainer: {
    marginBottom: 14,
  },

  phoneInput: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    backgroundColor: "#fff",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  phoneText: {
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: "#fff",
    paddingVertical: 0,
  },

  phoneCodeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#163916",
  },

  phoneNumberText: {
    fontSize: 15,
    color: "#163916",
  },
});
