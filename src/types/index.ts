export type RoadStatus = 'OPEN' | 'CLOSED' | 'WORK';

export interface RoadImage {
    url: string;
    addedBy: string;
    date: string;
}

export interface Road {
    id: string;
    name: string;
    status: RoadStatus;
    coordinates: [number, number][]; // Array of [lat, lng]
    images?: RoadImage[];
    lastUpdated: string;
}

export const STATUS_CONFIG: Record<RoadStatus, { color: string; label: string }> = {
    OPEN: { color: 'var(--color-success)', label: 'Açık' },
    CLOSED: { color: 'var(--color-danger)', label: 'Kapalı' },
    WORK: { color: 'var(--color-warning)', label: 'Çalışma Var' },
};

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    active: boolean;
}

export type LandmarkType = 'HOSPITAL' | 'COURT' | 'SCHOOL' | 'MILITARY' | 'OTHER';

export interface Landmark {
    id: string;
    type: LandmarkType;
    name: string;
    coordinates: { lat: number; lng: number };
}
