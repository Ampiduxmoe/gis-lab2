export function lerp(value: number, fromBounds: number[], toBounds: number[]) {
	const fromLength = fromBounds[1] - fromBounds[0];
	const relativeValue = (value - fromBounds[0]) / fromLength;
	const toLength = toBounds[1] - toBounds[0];
	const newValue = toBounds[0] + relativeValue * toLength;
	return newValue;
}

export function getInterpolator(fromBounds: number[], toBounds: number[]) {
	return (value: number) => lerp(value, fromBounds, toBounds);
}

export function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}
