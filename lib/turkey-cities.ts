export const TURKEY_CITIES: string[] = [
  "Adana",
  "Adiyaman",
  "Afyonkarahisar",
  "Agri",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydin",
  "Balikesir",
  "Bartin",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingol",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Canakkale",
  "Cankiri",
  "Corum",
  "Denizli",
  "Diyarbakir",
  "Duzce",
  "Edirne",
  "Elazig",
  "Erzincan",
  "Erzurum",
  "Eskisehir",
  "Gaziantep",
  "Giresun",
  "Gumushane",
  "Hakkari",
  "Hatay",
  "Igdir",
  "Isparta",
  "Istanbul",
  "Izmir",
  "Kahramanmaras",
  "Karabuk",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kirikkale",
  "Kirklareli",
  "Kirsehir",
  "Kilis",
  "Kocaeli",
  "Konya",
  "Kutahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Mugla",
  "Mus",
  "Nevsehir",
  "Nigde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Sanliurfa",
  "Siirt",
  "Sinop",
  "Sirnak",
  "Sivas",
  "Tekirdag",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Usak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
];

const TURKISH_CHAR_FOLD_MAP: Record<string, string> = {
  "Ç": "c",
  "ç": "c",
  "Ğ": "g",
  "ğ": "g",
  "İ": "i",
  "I": "i",
  "ı": "i",
  "Ö": "o",
  "ö": "o",
  "Ş": "s",
  "ş": "s",
  "Ü": "u",
  "ü": "u",
};

const CITY_QUERY_ALIAS_MAP: Record<string, string[]> = {
  adiyaman: ["Adiyaman", "Adıyaman"],
  agri: ["Agri", "Ağrı"],
  aydin: ["Aydin", "Aydın"],
  balikesir: ["Balikesir", "Balıkesir"],
  bartin: ["Bartin", "Bartın"],
  bingol: ["Bingol", "Bingöl"],
  canakkale: ["Canakkale", "Çanakkale"],
  cankiri: ["Cankiri", "Çankırı"],
  corum: ["Corum", "Çorum"],
  diyarbakir: ["Diyarbakir", "Diyarbakır"],
  duzce: ["Duzce", "Düzce"],
  elazig: ["Elazig", "Elazığ"],
  eskisehir: ["Eskisehir", "Eskişehir"],
  gumushane: ["Gumushane", "Gümüşhane"],
  igdir: ["Igdir", "Iğdır"],
  istanbul: ["Istanbul", "İstanbul"],
  izmir: ["Izmir", "İzmir"],
  kahramanmaras: ["Kahramanmaras", "Kahramanmaraş"],
  karabuk: ["Karabuk", "Karabük"],
  kirikkale: ["Kirikkale", "Kırıkkale"],
  kirklareli: ["Kirklareli", "Kırklareli"],
  kirsehir: ["Kirsehir", "Kırşehir"],
  kutahya: ["Kutahya", "Kütahya"],
  mugla: ["Mugla", "Muğla"],
  mus: ["Mus", "Muş"],
  nevsehir: ["Nevsehir", "Nevşehir"],
  nigde: ["Nigde", "Niğde"],
  sanliurfa: ["Sanliurfa", "Şanlıurfa"],
  sirnak: ["Sirnak", "Şırnak"],
  tekirdag: ["Tekirdag", "Tekirdağ"],
  usak: ["Usak", "Uşak"],
};

function foldCityName(city: string | null | undefined) {
  return String(city || "")
    .trim()
    .replace(/[ÇçĞğİIıÖöŞşÜü]/g, (char) => TURKISH_CHAR_FOLD_MAP[char] || char)
    .toLowerCase();
}

export function normalizeCityName(city: string | null | undefined) {
  return foldCityName(city);
}

export function sortCities(cities: string[]) {
  return [...cities].sort((a, b) => a.localeCompare(b, "tr"));
}

export function dedupeSortCities(cities: string[]) {
  return sortCities(
    Array.from(
      new Map(
        cities
          .map((city) => String(city || "").trim())
          .filter((city) => city.length > 0)
          .map((city) => [normalizeCityName(city), city])
      ).values()
    )
  );
}

export function getCityQueryValues(cities: string[]) {
  const values = new Set<string>();

  for (const city of cities) {
    const trimmedCity = String(city || "").trim();

    if (!trimmedCity) {
      continue;
    }

    values.add(trimmedCity);

    const normalizedCity = normalizeCityName(trimmedCity);
    const aliases = CITY_QUERY_ALIAS_MAP[normalizedCity] || [];

    for (const alias of aliases) {
      values.add(alias);
    }
  }

  return Array.from(values);
}
