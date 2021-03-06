import useResizeObserver from '@react-hook/resize-observer';
import { useGesture } from '@use-gesture/react';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { CommonProps } from '../common/CommonProps';
import { DebugOverlay } from './DebugOverlay';
import { GraticuleLayer } from './GraticuleLayer';
import { defaultGraticuleLayerSettings, GraticuleLayerSettings } from './GraticuleLayerSettings';
import { MapContext } from './MapContext';
import { defaultMapSettings, MapSettings } from './MapSettings';
import { defaultMapState, MapState } from './MapState';
import './MapWidget.css';
import { MyHelper } from './MyHelper';
import { TileLayer } from './TileLayer';
import { defaultTileLayerSettings, TileLayerSettings } from './TileLayerSettings';

export function MapWidget(props: Partial<Readonly<{
	mapSettings: MapSettings;
	mapState: MapState;
	onMapStateChange: (mapState: Readonly<MapState>) => void;
	tileLayerSettings: Readonly<TileLayerSettings>;
	graticuleLayerSettings: Readonly<GraticuleLayerSettings>;
	setGraticuleLayerSettings: (graticuleLayerSettings: Readonly<GraticuleLayerSettings>) => void;
}>> & CommonProps) {
	const [internalMapState, setInternalMapState] = useState<Readonly<MapState>>(() => {
		return props.mapState ?? defaultMapState;
	});
	const mapState = props.mapState ?? internalMapState;
	const onMapStateChange = props.onMapStateChange;
	useEffect(() => {
		if (onMapStateChange) {
			onMapStateChange(internalMapState);
		}
	}, [internalMapState, onMapStateChange]);
	const mapSettings = props.mapSettings ?? defaultMapSettings;
	const { minZoom, maxZoom, wheelSpeed } = mapSettings;
	const graticuleLayerSettings = props.graticuleLayerSettings ?? defaultGraticuleLayerSettings;
	const setGraticuleLayerSettings = props.setGraticuleLayerSettings;
	const tileLayerSettings = props.tileLayerSettings ?? defaultTileLayerSettings;
	const mapZoom = Math.max(minZoom, Math.min(mapState.mapZoom, maxZoom));
	const worldSize = Math.pow(2, mapZoom);
	const [dragStartState, setDragStartState] = useState(mapState);
	const bindGesture = useGesture({
		onDrag: event => {
			const offset = event.movement;
			if (event.first) {
				setDragStartState(mapState);
				return;
			}
			setInternalMapState({
				...mapState,
				centerX: dragStartState.centerX - offset[0] / worldSize,
				centerY: dragStartState.centerY - offset[1] / worldSize,
			});
		},
		onWheel: event => {
			let zoomSpeed = 1 / wheelSpeed;
			if (!Number.isFinite(zoomSpeed)) {
				zoomSpeed = 0;
			}
			setInternalMapState({
				...mapState,
				mapZoom: mapZoom - event.delta[1] * zoomSpeed,
			});
			if (setGraticuleLayerSettings) {
				const partitionPower = Math.max(0, Math.min(maxZoom, Math.round(mapZoom - Math.log2(tileLayerSettings.tileSize))));
				setGraticuleLayerSettings({
					...graticuleLayerSettings,
					latitudeStep: MyHelper.clamp(
						graticuleLayerSettings.latitudeStepDefault / 2 ** (partitionPower - 1),
						graticuleLayerSettings.minStep,
						graticuleLayerSettings.maxStep,
					),
					longitudeStep: MyHelper.clamp(
						graticuleLayerSettings.longitudeStepDefault / 2 ** (partitionPower	 - 1),
						graticuleLayerSettings.minStep,
						graticuleLayerSettings.maxStep,
					),
				});
			}
		},
	});
	const [mapContext, setMapContext] = useState<MapContext>(() => {
		return {
			width: 0,
			height: 0,
		};
	});
	const mainElement = useRef<HTMLDivElement | null>(null);
	useResizeObserver(mainElement, entry => {
		setMapContext({
			...mapContext,
			width: entry.contentRect.width,
			height: entry.contentRect.height,
		});
	});
	return <div
		{...bindGesture()}
		ref={mainElement}
		className={classNames('MapWidget', props.className)}
		style={{
			...props.style,
		}}
	>
		<TileLayer
			mapContext={mapContext}
			mapSettings={mapSettings}
			mapState={mapState}
			tileLayerSettings={tileLayerSettings}
		></TileLayer>
		<GraticuleLayer
			mapContext={mapContext}
			mapSettings={mapSettings}
			mapState={mapState}
			tileLayerSettings={tileLayerSettings}
			graticuleLayerSettings={graticuleLayerSettings}
		></GraticuleLayer>
		{mapSettings.debug &&
			<DebugOverlay style={{ left: 0, top: 0, minWidth: 300 }}>
				{JSON.stringify({
					mapSettings,
					mapContext,
					mapState,
					internalMapState,
					mapZoom,
				}, null, 2)}
			</DebugOverlay>
		}
	</div>;
}

