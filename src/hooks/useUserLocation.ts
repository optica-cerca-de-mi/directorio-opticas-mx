"use client";

import { useState, useEffect } from "react";

interface UserLocation {
  lat: number;
  lng: number;
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [consent, setConsent] = useState<"granted" | "denied" | "unknown">("unknown");

  useEffect(() => {
    // Leer desde localStorage
    const savedConsent = localStorage.getItem("location_consent");
    const savedLocation = localStorage.getItem("user_location");

    if (savedConsent === "granted" && savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
        setConsent("granted");
      } catch (e) {
        setConsent("unknown");
      }
    } else if (savedConsent === "denied") {
      setConsent("denied");
    } else {
      setConsent("unknown");
    }

    // Escuchar cambios desde el componente LocationConsent
    const handleLocationUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setLocation(customEvent.detail);
      setConsent("granted");
    };

    window.addEventListener("locationUpdated", handleLocationUpdate);
    return () => window.removeEventListener("locationUpdated", handleLocationUpdate);
  }, []);

  return { location, consent };
}