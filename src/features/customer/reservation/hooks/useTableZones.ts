import { useEffect, useMemo, useState } from 'react';
import { ZoneTables } from '../types/reservation.types';
import { getTables } from '../services/table.service';

export const useTableZones = () => {
  const [data, setData] = useState<ZoneTables>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    getTables()
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((err) => {
        if (mounted) setError(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const zones = useMemo(
    () => Object.keys(data),
    [data]
  );

  const [manualZone, setManualZone] = useState<string>('');

  const activeZone = useMemo(() => {
    if (manualZone) return manualZone;
    if (zones.length > 0) return zones[0];
    return '';
  }, [manualZone, zones]);

  const tables = useMemo(() => {
    if (!activeZone) return [];
    return data[activeZone] ?? [];
  }, [data, activeZone]);

  return {
    zones,
    activeZone,
    setActiveZone: setManualZone,
    tables,

    loading,
    error,
  };
};
