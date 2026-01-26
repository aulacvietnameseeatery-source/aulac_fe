import { ZoneTables } from '../types/reservation.types';

export const ZONES_DATA: ZoneTables = {
  'Ground Floor': [
    { id: 'T-01', name: 'Table T-01', guests: 4, status: 'available', image: '/images/table-selection/ground-floor/t-01.png' },
    { id: 'T-02', name: 'Table T-02', guests: 2, status: 'reserved', image: '/images/table-selection/ground-floor/t-02.png' },
    { id: 'T-03', name: 'Table T-03', guests: 6, status: 'available', image: '/images/table-selection/ground-floor/t-03.png' },
    { id: 'T-04', name: 'Table T-04', guests: 4, status: 'available', image: '/images/table-selection/ground-floor/t-04.png' },
    { id: 'T-05', name: 'Table T-05', guests: 8, status: 'available', image: '/images/table-selection/ground-floor/t-05.png' },
    { id: 'T-06', name: 'Table T-06', guests: 2, status: 'available', image: '/images/table-selection/ground-floor/t-06.png' },
    { id: 'T-07', name: 'Table T-07', guests: 4, status: 'reserved', image: '/images/table-selection/ground-floor/t-07.png' },
    { id: 'T-08', name: 'Table T-08', guests: 6, status: 'available', image: '/images/table-selection/ground-floor/t-08.png' },
  ],
  'Level 1': [
    { id: 'L1-01', name: 'Table L1-01', guests: 2, status: 'available', image: '/images/table-selection/level1/l1-01.png' },
    { id: 'L1-02', name: 'Table L1-02', guests: 4, status: 'reserved', image: '/images/table-selection/level1/l1-02.png' },
    { id: 'L1-03', name: 'Table L1-03', guests: 6, status: 'available', image: '/images/table-selection/level1/l1-03.png' },
  ],
  'VIP Garden': [
    { id: 'V-01', name: 'VIP Garden 01', guests: 10, status: 'available', image: '/images/table-selection/vip-garden/v-01.png' },
    { id: 'V-02', name: 'VIP Garden 02', guests: 8, status: 'reserved', image: '/images/table-selection/vip-garden/v-02.png' },
  ]
};