class GraticuleLayerSettingsClass {
	readonly latitudeStepDefault: number = 40;
	readonly longitudeStepDefault: number = 80;
	readonly latitudeStep: number = 40;
	readonly longitudeStep: number = 80;
	readonly minStep: number = 1;
	readonly maxStep: number = 100;
}

export type GraticuleLayerSettings = Readonly<GraticuleLayerSettingsClass>;
export const defaultGraticuleLayerSettings: GraticuleLayerSettings = new GraticuleLayerSettingsClass();
