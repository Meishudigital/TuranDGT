"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { dedupeSortCities, TURKEY_CITIES } from "@/lib/turkey-cities";

type Props = {
  mode: "onboarding" | "profile";
};

export default function ProfileForm({ mode }: Props) {
  const router = useRouter();
  const { user, profile, regions, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [cityToAdd, setCityToAdd] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  useEffect(() => {
    setFirstName(profile?.first_name || "");
    setLastName(profile?.last_name || "");
    setSelectedCities(dedupeSortCities(regions.map((item) => item.city)));
  }, [profile?.first_name, profile?.last_name, regions]);

  const availableCities = useMemo(() => {
    return TURKEY_CITIES.filter((city) => !selectedCities.includes(city));
  }, [selectedCities]);

  useEffect(() => {
    if (!cityToAdd && availableCities.length > 0) {
      setCityToAdd(availableCities[0]);
    }

    if (cityToAdd && !availableCities.includes(cityToAdd)) {
      setCityToAdd(availableCities[0] || "");
    }
  }, [availableCities, cityToAdd]);

  const handleAddCity = () => {
    if (!cityToAdd) {
      return;
    }

    setSelectedCities((prev) => dedupeSortCities([...prev, cityToAdd]));
    setSuccessText("");
    setErrorText("");
  };

  const handleRemoveCity = (city: string) => {
    setSelectedCities((prev) => prev.filter((item) => item !== city));
    setSuccessText("");
    setErrorText("");
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorText("Oturum bulunamadi. Lutfen yeniden giris yap.");
      return;
    }

    if (!firstName.trim()) {
      setErrorText("Isim zorunludur.");
      return;
    }

    if (!lastName.trim()) {
      setErrorText("Soy isim zorunludur.");
      return;
    }

    if (selectedCities.length === 0) {
      setErrorText("En az 1 il secmelisin.");
      return;
    }

    try {
      setSaving(true);
      setErrorText("");
      setSuccessText("");

      const { error: profileError } = await supabaseBrowser
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        setErrorText(profileError.message);
        return;
      }

      const existingByCity = new Map(regions.map((item) => [item.city, item]));
      const nextCities = new Set(selectedCities);
      const regionIdsToDelete = regions
        .filter((item) => !nextCities.has(item.city))
        .map((item) => item.id);
      const regionsToInsert = selectedCities
        .filter((city) => !existingByCity.has(city))
        .map((city) => ({
          user_id: user.id,
          city,
        }));

      if (regionIdsToDelete.length > 0) {
        const { error: deleteError } = await supabaseBrowser
          .from("user_regions")
          .delete()
          .in("id", regionIdsToDelete);

        if (deleteError) {
          setErrorText(deleteError.message);
          return;
        }
      }

      if (regionsToInsert.length > 0) {
        const { error: insertError } = await supabaseBrowser
          .from("user_regions")
          .insert(regionsToInsert);

        if (insertError) {
          setErrorText(insertError.message);
          return;
        }
      }

      await refreshProfile();

      if (mode === "onboarding") {
        router.replace("/");
        return;
      }

      setSuccessText("Profil bilgileri guncellendi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="surface-card rounded-[1.9rem] p-5 md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="section-kicker">
            {mode === "onboarding" ? "Zorunlu Kurulum" : "Profil Yonetimi"}
          </p>
          <h2 className="mt-2 text-[1.65rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
            {mode === "onboarding" ? "Profil bilgilerini tamamla" : "Profili duzenle"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-1)]">
            {mode === "onboarding"
              ? "Panele gecmek icin isim, soy isim ve en az 1 il secimi zorunludur."
              : "Kimlik ve bolge bilgilerini istedigin zaman buradan guncelleyebilirsin."}
          </p>
        </div>

        <div className="metric-chip">
          Secili il sayisi: <strong className="text-[var(--text-0)]">{selectedCities.length}</strong>
        </div>
      </div>

      {errorText && (
        <div className="info-banner info-banner--error mt-6">{errorText}</div>
      )}

      {successText && (
        <div className="info-banner info-banner--success mt-6">{successText}</div>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="surface-subcard rounded-[1.45rem] p-5">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
            <div>
              <label className="field-label">Isim</label>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Ornek: Ahmet"
                className="field-input"
              />
            </div>

            <div>
              <label className="field-label">Soy isim</label>
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Ornek: Yilmaz"
                className="field-input"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="profile-metric">
              <p className="profile-metric__label">Profil durumu</p>
              <p className="profile-metric__value">
                {mode === "onboarding" ? "Kurulum bekliyor" : "Aktif"}
              </p>
            </div>

            <div className="profile-metric">
              <p className="profile-metric__label">Maksimum alan</p>
              <p className="profile-metric__value">81 il</p>
            </div>
          </div>
        </section>

        <section className="surface-subcard rounded-[1.45rem] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="field-label">Yetkili il ekle</label>
              <select
                value={cityToAdd}
                onChange={(event) => setCityToAdd(event.target.value)}
                className="field-input"
              >
                {availableCities.length === 0 ? (
                  <option value="">Tum iller eklendi</option>
                ) : (
                  availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              onClick={handleAddCity}
              disabled={!cityToAdd || availableCities.length === 0}
              className="secondary-btn md:min-w-[168px]"
            >
              Bolge Ekle
            </button>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="field-label mb-0">Secili iller</p>
              <span className="text-sm text-[var(--text-2)]">
                {selectedCities.length === 0
                  ? "Henuz secim yok"
                  : `${selectedCities.length} il aktif`}
              </span>
            </div>

            {selectedCities.length === 0 ? (
              <div className="empty-state rounded-[1.35rem] border border-dashed border-white/10 bg-black/20">
                Henuz il secilmedi.
              </div>
            ) : (
              <div className="thin-scroll flex max-h-[16rem] flex-wrap gap-2 overflow-auto pr-1">
                {selectedCities.map((city) => (
                  <div key={city} className="city-chip">
                    <span>{city}</span>
                    <button
                      onClick={() => handleRemoveCity(city)}
                      className="ml-1 rounded-full border border-white/10 px-2 py-0.5 text-xs text-[var(--text-1)] transition hover:bg-white/5"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={() => void handleSubmit()}
          disabled={saving}
          className="primary-btn"
        >
          {saving
            ? "Kaydediliyor..."
            : mode === "onboarding"
              ? "Onayla ve Panele Gec"
              : "Profili Kaydet"}
        </button>

        {mode === "profile" && (
          <button
            onClick={() => router.push("/")}
            className="ghost-btn"
          >
            Panele Don
          </button>
        )}
      </div>
    </div>
  );
}
