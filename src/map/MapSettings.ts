class MapSettingsClass {
	minZoom: number = 6;
	maxZoom: number = 30;
	wheelSpeed: number = 100;
	debug: boolean = false;
}

export type MapSettings = Readonly<MapSettingsClass>;
export const defaultMapSettings: MapSettings = new MapSettingsClass();
