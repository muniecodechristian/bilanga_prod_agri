import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },

  headerName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  textMuted: {
    color: "#777",
    fontSize: 14,
  },

  banner: {
    width: "100%",
    height: 180,
  },

  profileSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: -60,
    marginBottom: 12,
  },

  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },

  editButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 30,
  },

  editButtonText: {
    color: "#222",
    fontWeight: "600",
  },

  profileDetails: {
    marginBottom: 8,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  profileName: {
    fontSize: 22,
    fontWeight: "700",
    marginRight: 8,
    color: "#222",
  },

  username: {
    color: "#777",
    marginBottom: 6,
  },

  bio: {
    color: "#222",
    marginBottom: 10,
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  followRow: {
    flexDirection: "row",
    marginTop: 6,
  },

  followItem: {
    marginRight: 20,
  },

  followText: {
    color: "#222",
  },

  followNumber: {
    fontWeight: "700",
    color: "#222",
  },
});
