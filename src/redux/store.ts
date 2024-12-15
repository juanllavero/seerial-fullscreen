import { configureStore } from "@reduxjs/toolkit";
import seriesImageSlice from "./slices/seriesImageSlice";
import imageLoadedSlice from "./slices/imageLoadedSlice";
import videoSlice from "./slices/videoSlice";
import dataSlice from "./slices/dataSlice";
import musicPlayerSlice from "./slices/musicPlayerSlice";
import fullscreenSectionsSlice from "./slices/fullscreenSectionsSlice";
import contextMenuSlice from "./slices/contextMenuSlice";

export const store = configureStore({
	reducer: {
		data: dataSlice,
		seriesImage: seriesImageSlice,
		imageLoaded: imageLoadedSlice,
		video: videoSlice,
		musicPlayer: musicPlayerSlice,
		fullscreenSection: fullscreenSectionsSlice,
		contextMenu: contextMenuSlice,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
