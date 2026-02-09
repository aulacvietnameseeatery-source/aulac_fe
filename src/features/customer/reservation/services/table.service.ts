import { ZoneTables } from '../types/reservation.types';

export const getTables = async (
): Promise<ZoneTables> => {
  // TODO: replace by real API
  const { ZONES_DATA } = await import('../data/zones.data');
  return ZONES_DATA;
};
