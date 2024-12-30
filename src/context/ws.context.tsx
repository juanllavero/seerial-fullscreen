import React, { useContext, useEffect, useState } from "react";
import { useDataContext } from "./data.context";
import { SeriesData } from "@interfaces/SeriesData";
import { useDispatch } from "react-redux";
import {
	addEpisode,
	addLibrary,
	addSeason,
	addSeries,
	updateLibrary,
	updateSeason,
	updateSeries,
} from "@redux/slices/dataSlice";

interface WebSocketsContextProps {
	downloading: boolean;
	setDownloading: React.Dispatch<React.SetStateAction<boolean>>;
	downloadPercentage: number;
	setDownloadPercentage: React.Dispatch<React.SetStateAction<number>>;
	analyzing: boolean;
	setAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
	seriesReceived: SeriesData | null;
	setSeriesReceived: React.Dispatch<React.SetStateAction<SeriesData | null>>;
	downloadAudio: (elementId: string, url: string) => Promise<void>;
	downloadVideo: (elementId: string, url: string) => Promise<void>;
}

export const WebSocketsContext = React.createContext<
	WebSocketsContextProps | undefined
>(undefined);

export const WebSocketsProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const dispatch = useDispatch();
	const { serverIP } = useDataContext();
	const [downloading, setDownloading] = React.useState<boolean>(false);
	const [downloadPercentage, setDownloadPercentage] =
		React.useState<number>(0);
	const [analyzing, setAnalyzing] = React.useState<boolean>(false);
	const [seriesReceived, setSeriesReceived] =
		React.useState<SeriesData | null>(null);

	const [ws, setWS] = useState<WebSocket | null>(null);

	useEffect(() => {
		if (!serverIP) return;

		setWS(new WebSocket(`ws://${serverIP}/ws`));
	}, [serverIP]);

	useEffect(() => {
		if (!ws) return;

		ws.onopen = () => {
			console.log("WebSocket connected");
		};

		ws.onmessage = (event) => {
			// Los mensajes vienen como cadenas JSON
			const message = JSON.parse(event.data);

         console.log(message);

			// Check message type
			switch (message.header) {
				case "DOWNLOAD_PROGRESS":
					// Actualizar la interfaz con el progreso
					setDownloadPercentage(message.body);
					break;
				case "DOWNLOAD_ERROR":
					setDownloading(false);
					break;
				case "DOWNLOAD_COMPLETE":
					setDownloading(false);
					break;
				case "ADD_LIBRARY":
					dispatch(addLibrary(message.body.library));
					break;
				case "UPDATE_LIBRARY":
					dispatch(updateLibrary(message.body.library));
					break;
				case "ADD_SERIES":
					dispatch(addSeries(message.body));
					break;
				case "UPDATE_SERIES":
					dispatch(updateSeries(message.body));
					break;
				case "ADD_SEASON":
					dispatch(addSeason(message.body));
					break;
				case "ADD_EPISODE":
					dispatch(addEpisode(message.body));
					break;
			}
		};

		ws.onclose = () => {
			setDownloading(false);
			setAnalyzing(false);
		};
	}, [ws]);

	const downloadVideo = async (elementId: string, url: string) => {
		setDownloadPercentage(0);
		setDownloading(true);

		fetch(`https:${serverIP}/downloadVideo`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url: url,
				downloadFolder: "resources/video/",
				fileName: elementId,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				console.log("Download started:", data);
			})
			.catch((error) => {
				console.error("Error downloading media:", error);
			});
	};

	const downloadAudio = async (elementId: string, url: string) => {
		setDownloadPercentage(0);
		setDownloading(true);

		fetch(`https:${serverIP}/downloadMusic`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url: url,
				downloadFolder: "resources/music/",
				fileName: elementId,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				console.log("Download started:", data);
			})
			.catch((error) => {
				console.error("Error downloading media:", error);
			});
	};

	return (
		<WebSocketsContext.Provider
			value={{
				downloading,
				setDownloading,
				downloadPercentage,
				setDownloadPercentage,
				analyzing,
				setAnalyzing,
				seriesReceived,
				setSeriesReceived,
				downloadAudio,
				downloadVideo,
			}}
		>
			{children}
		</WebSocketsContext.Provider>
	);
};

// Custom hook to use the WebSocketsContext
export const useWebSocketsContext = (): WebSocketsContextProps => {
	const context = useContext(WebSocketsContext);
	if (!context) {
		throw new Error(
			"useDownloadContext must be used within a WebSocketsProvider"
		);
	}
	return context;
};
