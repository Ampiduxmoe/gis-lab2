export abstract class MyHelper {
	static lerp(value: number, fromBounds: [number, number], toBounds: [number, number]) {
		const fromLength = fromBounds[1] - fromBounds[0];
		const relativeValue = (value - fromBounds[0]) / fromLength;
		const toLength = toBounds[1] - toBounds[0];
		const newValue = toBounds[0] + relativeValue * toLength;
		return newValue;
	}
	static getInterpolator(fromBounds: [number, number], toBounds: [number, number]) {
		return (value: number) => MyHelper.lerp(value, fromBounds, toBounds);
	}
	static clamp(value: number, min: number, max: number) {
		return Math.max(min, Math.min(max, value));
	}
}
