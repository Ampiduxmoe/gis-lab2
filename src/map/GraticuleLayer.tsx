import proj4 from 'proj4';
import { Layer, Stage, Line, Text } from 'react-konva';
import { CommonProps } from '../common/CommonProps';
import { GraticuleLayerSettings } from './GraticuleLayerSettings';
import { MapContext } from './MapContext';
import { MapSettings } from './MapSettings';
import { MapState } from './MapState';
import { MyHelper } from './MyHelper';
import { TileLayerSettings } from './TileLayerSettings';

export function GraticuleLayer(props: Readonly<{
	mapContext: MapContext;
	mapState: MapState;
	mapSettings: MapSettings;
	tileLayerSettings: TileLayerSettings;
	graticuleLayerSettings: GraticuleLayerSettings;
}> & CommonProps) {
	const { mapContext, mapState, tileLayerSettings, graticuleLayerSettings } = props;
	const { latitudeStep, longitudeStep } = graticuleLayerSettings;
	const { centerX, centerY, mapZoom } = mapState;
	const { width, height } = mapContext;
	const { tileSize, maxZoom } = tileLayerSettings;
	const zoom = mapZoom - Math.log2(tileSize);
	const roundedZoom = Math.max(0, Math.min(maxZoom, Math.round(zoom)));
	const tileCount = Math.pow(2, roundedZoom);
	const worldSize = tileCount * tileSize;
	const distanceToCenterX = centerX * worldSize;
	const distanceToCenterY = centerY * worldSize;
	const left = distanceToCenterX - width * 0.5;
	const top = distanceToCenterY - height * 0.5;
	const minMeteres = -20_037_508.3427892;
	const maxMeteres = 20_037_508.3427892;
	const metersToFloat = MyHelper.getInterpolator([minMeteres, maxMeteres], [0, 1]);
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

	for (let i = 0; i < 90; i += latitudeStep) {
		if (!isMapVisible()) {
			break;
		}
		for (const sign of [-1, 1]) {
			if (i === 0 && sign === -1) {
				continue;
			}
			const latitudeInMeters = proj4('EPSG:4326', 'EPSG:3857', [0, sign * i])[1];
			const latitudeFloat = metersToFloat(latitudeInMeters);
			const latitudePosX = -left;
			const latitudePosY = -top + worldSize * latitudeFloat;
			const textPosX = Math.max(0, -left);
			const lineLength = worldSize;
			const points = [0, 0, lineLength, 0];
			if (isFloatInsideScreenH(latitudeFloat)) {
				const line = <Line
					key={`latitude${sign * i}`}
					x={latitudePosX}
					y={latitudePosY}
					points={points}
					stroke={gratStrokeColor}
					strokeWidth={gratStrokeWidth}
					dash={gratDash}
				/>;
				lines.push(line);
				const text = <Text
					key={`latText${sign * i}`}
					x={textPosX}
					y={latitudePosY}
					fontSize={textSize}
					text={`${i} grad`}
				/>;
				texts.push(text);
			}
		}
	}
	for (let j = 0; j < 180; j += longitudeStep) {
		if (!isMapVisible()) {
			break;
		}
		for (const sign of [-1, 1]) {
			if (j === 0 && sign === -1) {
				continue;
			}
			const longitudeInMeters = proj4('EPSG:4326', 'EPSG:3857', [sign * j, 0])[0];
			const longitudeFloat = metersToFloat(longitudeInMeters);
			const longitudePosX = -left + worldSize * longitudeFloat;
			const longitudePosY = -top;
			const textPosY = Math.min(-top + worldSize - textSize, height - textSize);
			const lineLength = worldSize;
			const points = [0, 0, 0, lineLength];
			if (isFloatInsideScreenW(longitudeFloat)) {
				const line = <Line
					key={`longitude${sign * j}`}
					x={longitudePosX}
					y={longitudePosY}
					points={points}
					stroke={gratStrokeColor}
					strokeWidth={gratStrokeWidth}
					dash={gratDash}
				/>;
				lines.push(line);
				const text = <Text
					key={`longText${sign * j}`}
					x={longitudePosX}
					y={textPosY}
					fontSize={textSize}
					text={`${j} grad`}
				/>;
				texts.push(text);
			}
		}
	}

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
