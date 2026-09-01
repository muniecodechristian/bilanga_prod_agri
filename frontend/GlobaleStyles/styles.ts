import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  iconRound: {
    backgroundColor: "#E9F6EA",
    padding: 10,
    borderRadius: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  notificationBadge: {
    position: "absolute",
    top: -12,
    right: -8,
    backgroundColor: "red",
    borderRadius: 50,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#163916",
    marginBottom: 8,
  },

  catItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#F1FBF2",
    width: 90,
  },

  catText: {
    fontSize: 12,
    marginTop: 6,
    color: "#164A16",
    fontWeight: "600",
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  gridTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
    color: "#164A16",
    textAlign: "center",
  },

  banner: {
    padding: 12,
    borderRadius: 38,
    marginTop: 30,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  bannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F5E14",
  },

  bannerSub: {
    color: "#2E6B2E",
    marginTop: 2,
  },

  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  newsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8F4E8",
  },

  newsImage: {
    width: "100%",
    height: 140,
  },

  newsTitle: {
    fontWeight: "700",
    paddingTop: 8,
    paddingHorizontal: 10,
    paddingBottom: 12,
  },

  newsMore: {
    color: "#2E7D32",
    fontWeight: "600",
    marginTop: 4,
  },

  priceCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    width: 200,
    borderWidth: 1,
    borderColor: "#E8F4E8",
    alignItems: "center",
  },

  priceCommodity: {
    fontSize: 14,
    fontWeight: "600",
    color: "#164A16",
  },

  priceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F5E14",
    marginTop: 6,
  },

  weatherCard: {
    padding: 18,
    borderRadius: 24,
    marginTop: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  weatherIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  weatherTemp: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
  },

  weatherCity: {
    fontSize: 14,
    color: "#E8F5E9",
    marginTop: 2,
  },

  weatherDesc: {
    fontSize: 13,
    color: "#C8E6C9",
    marginTop: 2,
    fontStyle: "italic",
  },

  weatherStats: {
    flexDirection: "row",
    marginTop: 10,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
  },

  statText: {
    color: "#fff",
    marginLeft: 4,
    fontWeight: "600",
  },

  catIcon: {
    alignSelf: "center",
    height: 60,
    width: 60,
    borderRadius: 12,
    padding: 20,
  },
});
