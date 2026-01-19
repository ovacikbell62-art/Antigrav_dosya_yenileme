import type { Road } from '../types';

// Ovacık Center: 39.3596, 39.2084

export const MOCK_ROADS: Road[] = [
    {
        id: '1',
        name: 'Tunceli - Ovacık Yolu',
        status: 'OPEN',
        lastUpdated: '2024-01-16T10:00:00',
        coordinates: [
            [39.3596, 39.2084],
            [39.3500, 39.2100],
            [39.3400, 39.2200],
            [39.3300, 39.2300], // Heading South-East roughly
        ]
    },
    {
        id: '2',
        name: 'Yeşilyazı Köy Yolu',
        status: 'CLOSED',
        lastUpdated: '2024-01-16T09:30:00',
        coordinates: [
            [39.3596, 39.2084],
            [39.3650, 39.1900],
            [39.3700, 39.1800], // Heading North-West
        ]
    },
    {
        id: '3',
        name: 'Ziyaret Yolu',
        status: 'WORK',
        lastUpdated: '2024-01-16T11:15:00',
        coordinates: [
            [39.3596, 39.2084],
            [39.3550, 39.2200],
            [39.3500, 39.2300], // Heading East
        ]
    },
    {
        id: '4',
        name: 'Hozat Bağlantısı',
        status: 'OPEN',
        lastUpdated: '2024-01-16T08:00:00',
        coordinates: [
            [39.3596, 39.2084],
            [39.3400, 39.1900],
            [39.3200, 39.1800], // Heading South-West
        ]
    }
];
