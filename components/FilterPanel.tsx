"use client";

import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ListingsTable from "@/components/ListingsTable";
import { fetchWithSession } from "@/lib/auth-client";
import { writeCampaignDraft } from "@/lib/campaign-draft";
import { normalizeCityName } from "@/lib/turkey-cities";

type Listing = {
  id: string;
  title: string | null;
  owner_name: string | null;
  phone_number: string | null;
  phone_e164: string | null;
  price: number | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  platform: string | null;
  url: string | null;
  last_message_sent_at: string | null;
  last_message_status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Props = {
  session: Session;
  allowedCities: string[];
};

type PersistedFilterPanelState = {
  city: string;
  district: string;
  neighborhood: string;
  items: Listing[];
  selectedIds: string[];
  currentPage: number;
};

function getPanelStorageKey(userId: string) {
  return `emlak-filter-panel:${userId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePersistedState(
  value: unknown,
  allowedCities: string[]
): PersistedFilterPanelState | null {
  if (!isRecord(value)) {
    return null;
  }

  const allowedCitySet = new Set(allowedCities.map(normalizeCityName));
  const rawItems = Array.isArray(value.items) ? (value.items as Listing[]) : [];
  const items = rawItems.filter((item) => {
    if (!item || typeof item.id !== "string") {
      return false;
    }

    if (!item.city) {
      return true;
    }

    return allowedCitySet.has(normalizeCityName(item.city));
  });

  const itemIds = new Set(items.map((item) => item.id));
  const selectedIds = Array.isArray(value.selectedIds)
    ? value.selectedIds.filter(
        (item): item is string => typeof item === "string" && itemIds.has(item)
      )
    : [];

  const city =
    typeof value.city === "string" &&
    (!value.city || allowedCitySet.has(normalizeCityName(value.city)))
      ? value.city
      : "";

  return {
    city,
    district: typeof value.district === "string" ? value.district : "",
    neighborhood:
      typeof value.neighborhood === "string" ? value.neighborhood : "",
    items,
    selectedIds,
    currentPage:
      typeof value.currentPage === "number" && value.currentPage > 0
        ? Math.floor(value.currentPage)
        : 1,
  };
}

export default function FilterPanel({ session, allowedCities }: Props) {
  const router = useRouter();
  const sessionUserId = session.user.id;
  const allowedCitiesKey = useMemo(() => allowedCities.join("||"), [allowedCities]);
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [items, setItems] = useState<Listing[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [searching, setSearching] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [stateHydrated, setStateHydrated] = useState(false);
  const restoreStateRef = useRef<PersistedFilterPanelState | null>(null);
  const districtRef = useRef(district);
  const neighborhoodRef = useRef(neighborhood);

  useEffect(() => {
    districtRef.current = district;
  }, [district]);

  useEffect(() => {
    neighborhoodRef.current = neighborhood;
  }, [neighborhood]);

  useEffect(() => {
    if (!sessionUserId) {
      restoreStateRef.current = null;
      setStateHydrated(false);
      return;
    }

    try {
      const rawValue = window.localStorage.getItem(getPanelStorageKey(sessionUserId));

      if (!rawValue) {
        restoreStateRef.current = null;
        setStateHydrated(true);
        return;
      }

      const parsedValue = JSON.parse(rawValue) as unknown;
      const nextState = normalizePersistedState(parsedValue, allowedCities);

      if (!nextState) {
        restoreStateRef.current = null;
        setStateHydrated(true);
        return;
      }

      restoreStateRef.current = nextState;
      setCity(nextState.city);
      setDistrict(nextState.district);
      setNeighborhood(nextState.neighborhood);
      setItems(nextState.items);
      setSelectedIds(nextState.selectedIds);
      setCurrentPage(nextState.currentPage);
    } catch (error) {
      console.error("Failed to restore filter panel state", error);
      restoreStateRef.current = null;
    } finally {
      setStateHydrated(true);
    }
  }, [allowedCities, allowedCitiesKey, sessionUserId]);

  useEffect(() => {
    if (!sessionUserId || !stateHydrated) {
      return;
    }

    const payload: PersistedFilterPanelState = {
      city,
      district,
      neighborhood,
      items,
      selectedIds,
      currentPage,
    };

    window.localStorage.setItem(getPanelStorageKey(sessionUserId), JSON.stringify(payload));
  }, [
    city,
    currentPage,
    district,
    items,
    neighborhood,
    selectedIds,
    sessionUserId,
    stateHydrated,
  ]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoadingCities(true);
        setErrorText("");

        const res = await fetchWithSession(session, "/api/filters/cities");
        const json = await res.json();

        if (!res.ok || !json.ok) {
          setErrorText(json.error || "Iller alinamadi.");
          setCities([]);
          return;
        }

        setCities(json.items || []);
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : "Iller alinamadi.");
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    void loadCities();
  }, [session]);

  useEffect(() => {
    if (!city) {
      setDistricts([]);
      setDistrict("");
      setNeighborhoods([]);
      setNeighborhood("");
      return;
    }

    const loadDistricts = async () => {
      const desiredDistrict =
        restoreStateRef.current?.city === city
          ? restoreStateRef.current.district
          : districtRef.current;

      try {
        setLoadingDistricts(true);
        setErrorText("");

        const res = await fetchWithSession(
          session,
          `/api/filters/districts?city=${encodeURIComponent(city)}`
        );
        const json = await res.json();

        if (!res.ok || !json.ok) {
          setErrorText(json.error || "Ilceler alinamadi.");
          setDistricts([]);
          return;
        }

        const nextDistricts = json.items || [];
        setDistricts(nextDistricts);

        const nextDistrict =
          desiredDistrict && nextDistricts.includes(desiredDistrict)
            ? desiredDistrict
            : "";

        if (districtRef.current !== nextDistrict) {
          setDistrict(nextDistrict);
        }
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : "Ilceler alinamadi.");
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    void loadDistricts();
  }, [city, session]);

  useEffect(() => {
    if (!city || !district) {
      setNeighborhoods([]);
      setNeighborhood("");
      return;
    }

    const loadNeighborhoods = async () => {
      const desiredNeighborhood =
        restoreStateRef.current?.city === city &&
        restoreStateRef.current?.district === district
          ? restoreStateRef.current.neighborhood
          : neighborhoodRef.current;

      try {
        setLoadingNeighborhoods(true);
        setErrorText("");

        const res = await fetchWithSession(
          session,
          `/api/filters/neighborhoods?city=${encodeURIComponent(
            city
          )}&district=${encodeURIComponent(district)}`
        );
        const json = await res.json();

        if (!res.ok || !json.ok) {
          setErrorText(json.error || "Mahalleler alinamadi.");
          setNeighborhoods([]);
          return;
        }

        const nextNeighborhoods = json.items || [];
        setNeighborhoods(nextNeighborhoods);

        const nextNeighborhood =
          desiredNeighborhood && nextNeighborhoods.includes(desiredNeighborhood)
            ? desiredNeighborhood
            : "";

        if (neighborhoodRef.current !== nextNeighborhood) {
          setNeighborhood(nextNeighborhood);
        }

        restoreStateRef.current = null;
      } catch (error) {
        setErrorText(
          error instanceof Error ? error.message : "Mahalleler alinamadi."
        );
        setNeighborhoods([]);
      } finally {
        setLoadingNeighborhoods(false);
      }
    };

    void loadNeighborhoods();
  }, [city, district, session]);

  const clearSearchResults = () => {
    setItems([]);
    setSelectedIds([]);
    setCurrentPage(1);
    setSuccessText("");
  };

  const handleCitySelect = (nextCity: string) => {
    setCity(nextCity);
    setDistrict("");
    setNeighborhood("");
    setDistricts([]);
    setNeighborhoods([]);
    clearSearchResults();
  };

  const handleDistrictSelect = (nextDistrict: string) => {
    setDistrict(nextDistrict);
    setNeighborhood("");
    setNeighborhoods([]);
    clearSearchResults();
  };

  const handleNeighborhoodSelect = (nextNeighborhood: string) => {
    setNeighborhood(nextNeighborhood);
    clearSearchResults();
  };

  const handleResetFilters = () => {
    setCity("");
    setDistrict("");
    setNeighborhood("");
    setDistricts([]);
    setNeighborhoods([]);
    clearSearchResults();
    setErrorText("");
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      setErrorText("");
      setSuccessText("");
      setSelectedIds([]);
      setCurrentPage(1);

      const res = await fetchWithSession(session, "/api/listings/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city,
          district,
          neighborhood,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setErrorText(json.error || "Kayitlar alinamadi.");
        setItems([]);
        return;
      }

      setItems(json.items || []);
      setSuccessText(`${(json.items || []).length} ilan bulundu.`);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Kayitlar alinamadi.");
      setItems([]);
    } finally {
      setSearching(false);
    }
  };

  const handleToggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleAll = (ids: string[]) => {
    const everySelected = ids.every((id) => selectedIds.includes(id));

    if (everySelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const selectedListings = useMemo(() => {
    return items.filter((item) => selectedIds.includes(item.id));
  }, [items, selectedIds]);

  const activeScope = useMemo(() => {
    return [city, district, neighborhood].filter(Boolean).join(" / ") || "Tum yetkili iller";
  }, [city, district, neighborhood]);

  const handleSendToCampaign = () => {
    if (selectedListings.length === 0) {
      setErrorText("Kampanya olusturmak icin once en az 1 ilan secmelisin.");
      return;
    }

    writeCampaignDraft(session.user.id, {
      sourceScope: activeScope,
      city,
      district,
      neighborhood,
      updatedAt: new Date().toISOString(),
      items: selectedListings.map((item) => ({
        id: item.id,
        title: item.title,
        owner_name: item.owner_name,
        phone_number: item.phone_number,
        phone_e164: item.phone_e164,
        city: item.city,
        district: item.district,
        neighborhood: item.neighborhood,
        price: item.price,
        url: item.url,
      })),
    });

    router.push("/campaigns");
  };

  return (
    <div className="space-y-5">
      {errorText && (
        <div className="info-banner info-banner--error page-rise page-rise-3">
          {errorText}
        </div>
      )}

      {successText && (
        <div className="info-banner info-banner--success page-rise page-rise-3">
          {successText}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="space-y-5">
          <section className="surface-card page-rise page-rise-3 rounded-[1.65rem] p-4 md:p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-xl">
                  <p className="section-kicker">Arama</p>
                  <h2 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
                    Bolge icinde ilan ara
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
                    Filtrele, listele ve secimi kampanyaya tası.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[29rem]">
                  <div className="compact-stat">
                    <p className="compact-stat__label">Kapsam</p>
                    <p className="compact-stat__value">{activeScope}</p>
                  </div>

                  <div className="compact-stat">
                    <p className="compact-stat__label">Sonuc</p>
                    <p className="compact-stat__value">{items.length}</p>
                  </div>

                  <div className="compact-stat">
                    <p className="compact-stat__label">Secim</p>
                    <p className="compact-stat__value">{selectedIds.length}</p>
                  </div>
                </div>
              </div>

              <div className="surface-subcard rounded-[1.35rem] p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="field-label mb-1">Filtreler</p>
                    <p className="text-sm text-[var(--text-3)]">Yetkili alanlar icinde arama yap.</p>
                  </div>

                  <span className="metric-chip">
                    Yetkili il <strong className="text-[var(--text-0)]">{allowedCities.length}</strong>
                  </span>
                </div>

                <div className="grid gap-3 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,0.95fr)_minmax(0,0.95fr)_140px_120px]">
                  <div>
                    <label className="field-label">Il</label>
                    <select
                      value={city}
                      onChange={(event) => handleCitySelect(event.target.value)}
                      className="field-input"
                    >
                      <option value="">
                        {loadingCities ? "Yukleniyor..." : "Tum yetkili iller"}
                      </option>
                      {cities.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="field-label">Ilce</label>
                    <select
                      value={district}
                      onChange={(event) => handleDistrictSelect(event.target.value)}
                      disabled={!city || loadingDistricts}
                      className="field-input disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">
                        {!city
                          ? "Once il sec"
                          : loadingDistricts
                            ? "Yukleniyor..."
                            : "Tum ilceler"}
                      </option>
                      {districts.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="field-label">Mahalle</label>
                    <select
                      value={neighborhood}
                      onChange={(event) => handleNeighborhoodSelect(event.target.value)}
                      disabled={!city || !district || loadingNeighborhoods}
                      className="field-input disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">
                        {!city || !district
                          ? "Once il ve ilce sec"
                          : loadingNeighborhoods
                            ? "Yukleniyor..."
                            : "Tum mahalleler"}
                      </option>
                      {neighborhoods.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => void handleSearch()}
                      disabled={searching || loadingCities}
                      className="primary-btn w-full"
                    >
                      {searching ? "Araniyor..." : "Ara"}
                    </button>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleResetFilters}
                      disabled={!city && !district && !neighborhood && items.length === 0}
                      className="ghost-btn w-full"
                    >
                      Temizle
                    </button>
                  </div>
                </div>

                <div className="soft-divider mt-4 pt-4">
                  <div className="mb-3">
                    <p className="field-label mb-1">Hizli secim</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCitySelect("")}
                      className={`city-chip city-chip--button ${
                        !city ? "city-chip--active" : "city-chip--muted"
                      }`}
                    >
                      Tum yetkili iller
                    </button>

                    {allowedCities.map((item) => {
                      const active = normalizeCityName(item) === normalizeCityName(city);

                      return (
                        <button
                          key={item}
                          onClick={() => handleCitySelect(item)}
                          className={`city-chip city-chip--button ${
                            active ? "city-chip--active" : "city-chip--muted"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ListingsTable
            items={items}
            selectedIds={selectedIds}
            currentPage={currentPage}
            onToggleOne={handleToggleOne}
            onToggleAll={handleToggleAll}
            onPageChange={setCurrentPage}
          />
        </div>

        <aside className="surface-card page-rise page-rise-4 rounded-[1.65rem] p-4 xl:sticky xl:top-5">
          <div className="flex flex-col gap-4">
            <div>
              <p className="section-kicker">Secim</p>
              <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
                Kampanya sepati
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
                Secilen ilanlar kampanya ekranina tasinir.
              </p>
            </div>

            <div className="grid gap-2">
              <div className="compact-stat">
                <p className="compact-stat__label">Kapsam</p>
                <p className="compact-stat__value">{activeScope}</p>
              </div>

              <div className="compact-stat">
                <p className="compact-stat__label">Secilen</p>
                <p className="compact-stat__value">{selectedIds.length}</p>
              </div>

              <div className="compact-stat">
                <p className="compact-stat__label">Durum</p>
                <p className="compact-stat__value">
                  {selectedIds.length > 0 ? "Kampanyaya hazir" : "Secim bekliyor"}
                </p>
              </div>
            </div>

            <div className="surface-subcard rounded-[1.25rem] p-4">
              <p className="field-label mb-2">Ozet</p>
              <p className="text-sm leading-6 text-[var(--text-2)]">
                {selectedIds.length > 0
                  ? `${selectedIds.length} ilan kampanya icin hazir.`
                  : "Henuz secim yok."}
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <button
                  onClick={handleSendToCampaign}
                  disabled={selectedIds.length === 0}
                  className="primary-btn w-full"
                >
                  Kampanya Ekranina Gec
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  disabled={selectedIds.length === 0}
                  className="ghost-btn w-full"
                >
                  Secimi Temizle
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
