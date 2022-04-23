class GraticuleLayerSettingsClass {
	readonly latitudeStepDefault: number = 20;
	readonly longitudeStepDefault: number = 40;
	readonly latitudeStep: number = 20;
	readonly longitudeStep: number = 40;
	readonly minStep: number = 0.1;
	readonly maxStep: number = 60;
}

export type GraticuleLayerSettings = Readonly<GraticuleLayerSettingsClass>;
export const defaultGraticuleLayerSettings: GraticuleLayerSettings = new GraticuleLayerSettingsClass();
