import proj4 from 'proj4';
import { Layer, Stage, Line, Text } from 'react-konva';
import { CommonProps } from '../common/CommonProps';
import { GraticuleLayerSettings } from './GraticuleLayerSettings';
import { MapContext } from './MapContext';
import { MapSettings } from './MapSettings';
import { MapState } from './MapState';
import { getInterpolator } from './MyHelper';
import { TileLayerSettings } from './TileLayerSettings';

export function GraticuleLayer(props: Readonly<{
	mapContext: MapContext;
	mapState: MapState;
	mapSettings: MapSettings;
	tileLayerSettings: TileLayerSettings;
	graticuleLayerSettings: GraticuleLayerSettings;
}> & CommonProps) {
	const { mapContext, mapState, mapSettings, tileLayerSettings, graticuleLayerSettings } = props;
	const { latitudeStepDefault, longitudeStepDefault, latitudeStep, longitudeStep, minStep, maxStep } = graticuleLayerSettings;
	const { centerX, centerY, mapZoom } = mapState;
	const { width, height } = mapContext;
	const { debug } = mapSettings;
	const { tileSize, maxZoom } = tileLayerSettings;
	const zoom = mapZoom - Math.log2(tileSize);
	const roundedZoom = Math.max(0, Math.min(maxZoom, Math.round(zoom)));
	const tileCount = Math.pow(2, roundedZoom);
	const worldSize = tileCount * tileSize;
	const distanceToCenterX = centerX * worldSize;
	const distanceToCenterY = centerY * worldSize;
	const left = distanceToCenterX - width * 0.5;
	const right = distanceToCenterX + width * 0.5;
	const top = distanceToCenterY - height * 0.5;
	const bottom = distanceToCenterY + height * 0.5;
	const minMeteres = -20_037_508.3427892;
	const maxMeteres = 20_037_508.3427892;
	const metersToFloat = getInterpolator([minMeteres, maxMeteres], [0, 1]);
	const isFloatInsideScreenW = (float: number) => {
		const screenPosX = -left + worldSize * float;
		return screenPosX <= width && screenPosX >= 0;
	};
	const isFloatInsideScreenH = (float: number) => {
		const screenPosY = -top + worldSize * float;
		return screenPosY <= height && screenPosY >= 0;
	};
	const isMapVisible = () => {
		if (-left > width || -left + worldSize < 0) {
			return false;
		}
		if (-top > height || -top + worldSize < 0) {
			return false;
		}
		return true;
	};
	const lines: JSX.Element[] = [];
	const texts: JSX.Element[] = [];

	const gratStrokeColor = 'red';
	const gratStrokeWidth = 2;
	const gratDash = [2, 4];

	const textSize = 12;
	// console.log(-left, -left + worldSize);
	for (let i = 0; i < 90; i += latitudeStep) {
		if (!isMapVisible()) {
			break;
		}
		const latitudeInMeters = proj4('EPSG:4326', 'EPSG:3857', [0, i])[1];
		const latitudeFloat = metersToFloat(latitudeInMeters);
		const latitudePosUpper = -top + worldSize * (1 - latitudeFloat);
		const latitudePosLower = -top + worldSize * latitudeFloat;
		const posX = Math.max(0, -left);
		const lineLength = worldSize;
		const points = [0, 0, lineLength, 0];
		if (isFloatInsideScreenH(1 - latitudeFloat)) {
			const topLine = <Line
				key={`latitude${-i}`}
				x={-left}
				y={latitudePosUpper}
				points={points}
				stroke={gratStrokeColor}
				strokeWidth={gratStrokeWidth}
				dash={gratDash}
			/>;
			lines.push(topLine);
			const topText = <Text
				key={`latText${-i}`}
				x={posX}
				y={latitudePosUpper}
				fontSize={textSize}
				text={`${i} grad`}
			/>;
			texts.push(topText);
			if (i === 0) {
				continue;
			}
		}
		if (isFloatInsideScreenH(latitudeFloat)) {
			const bottomLine = <Line
				key={`latitude${i}`}
				x={-left}
				y={latitudePosLower}
				points={points}
				stroke={gratStrokeColor}
				strokeWidth={gratStrokeWidth}
				dash={gratDash}
			/>;
			lines.push(bottomLine);
			const bottomText = <Text
				key={`latText${i}`}
				x={posX}
				y={latitudePosLower}
				fontSize={textSize}
				text={`${i} grad`}
			/>;
			texts.push(bottomText);
		}
	}
	for (let j = 0; j < 180; j += longitudeStep) {
		if (!isMapVisible()) {
			break;
		}
		const longitudeInMeters = proj4('EPSG:4326', 'EPSG:3857', [j, 0])[0];
		const longitudeFloat = metersToFloat(longitudeInMeters);
		const longitudePosLeft = -left - worldSize * (longitudeFloat - 1);
		const longitudePosRight = -left + worldSize * longitudeFloat;
		const posY = Math.min(-top + worldSize - textSize, height - textSize);
		const points = [0, 0, 0, worldSize];
		if (isFloatInsideScreenW(1 - longitudeFloat)) {
			const leftLine = <Line
				key={`longitude${-j}`}
				x={longitudePosLeft}
				y={-top}
				points={points}
				stroke={gratStrokeColor}
				strokeWidth={gratStrokeWidth}
				dash={gratDash}
			/>;
			lines.push(leftLine);
			const leftText = <Text
				key={`longText${-j}`}
				x={longitudePosLeft}
				y={posY}
				fontSize={textSize}
				text={`${j} grad`}
			/>;
			texts.push(leftText);
			if (j === 0) {
				continue;
			}
		}
		if (isFloatInsideScreenW(longitudeFloat)) {
			const rightLine = <Line
				key={`longitude${j}`}
				x={longitudePosRight}
				y={-top}
				points={points}
				stroke={gratStrokeColor}
				strokeWidth={gratStrokeWidth}
				dash={gratDash}
			/>;
			lines.push(rightLine);
			const rightText = <Text
				key={`longText${j}`}
				x={longitudePosRight}
				y={posY}
				fontSize={textSize}
				text={`${j} grad`}
			/>;
			texts.push(rightText);
		}
	}
	// console.log(`rendered ${lines.length} lines`);
	// console.log(isMapVisible());
	// console.log(-left, right);

	return (
		<Stage x={0} y={0} width={width} height={height}>
			<Layer>
				{texts}
			</Layer>
			<Layer>
				{lines}
			</Layer>
		</Stage>
	);
}
