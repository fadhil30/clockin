import { useState, useCallback } from 'react';

interface GeoResult { latitude: number; longitude: number; }

export const useGeolocation = () => {
  const [position, setPosition] = useState<GeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(() => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation not supported.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError('Location access denied. Proceeding without location.');
        setLoading(false);
      },
    );
  }, []);

  return { position, error, loading, request };
};
