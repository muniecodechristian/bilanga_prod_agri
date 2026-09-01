export interface Coords {
  lat: number;
  lon: number;
}

export const reverseCityToCoords = async (city: string): Promise<Coords | null> => {
  if (!city) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
      city
    )}&format=json&limit=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "bilangaApp/1.0 (contact@bilanga.app)",
        "Accept": "application/json",
      },
    });

    // 🔥 Vérifier que la réponse est bien du JSON
    const text = await res.text();

    if (!res.ok || !text.startsWith("[")) {
      console.log("Nominatim response (not JSON):", text);
      return null;
    }

    const data = JSON.parse(text);

    if (data.length > 0) {
      return {
        lat: Number(data[0].lat),
        lon: Number(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.log("Reverse geocode error:", error);
    return null;
  }
};
