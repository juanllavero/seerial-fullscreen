import { useDispatch } from "react-redux";
import { useEffect, useRef } from "react";
import "../../i18n";
import "../../Fullscreen.scss";
import HomeView from "./homeView/HomeView";
import ShowsView from "./showsView/ShowsView";
import { useSectionContext } from "context/section.context";
import { FullscreenSections } from "@data/enums/Sections";
import NoContentFullscreen from "./NoContentFullscreen";
import HeaderComponent from "./HeaderComponent";
import BackgroundImages from "./BackgroundImages";
import DetailsView from "./detailsView/DetailsView";
import MainMenu from "./MainMenu";
import { selectLibrary, setLibraries } from "@redux/slices/dataSlice";
import Loading from "@components/utils/Loading";
import VideoControls from "./videoPlayer/VideoControls";
import { LibraryData } from "@interfaces/LibraryData";
import useFetchArray from "hooks/useFetch";

function MainFullscreen() {
	const dispatch = useDispatch();
	const { data, loading, error } = useFetchArray<LibraryData>(
		"http://192.168.1.45:3000/libraries"
	);
	const { currentFullscreenSection } = useSectionContext();

	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		dispatch(selectLibrary(null));
	}, []);

	useEffect(() => {
		if (data) {
			dispatch(setLibraries(data));
		}
	}, [data]);

	return (
		<>
			{loading ? (
				<>
					<Loading />
				</>
			) : (
				<>
					{/* VIDEO PLAYER CONTROLS */}
					{/* <VideoControls /> */}

					{/* MAIN MENU */}
					<MainMenu />

					{/* BACKGROUND IMAGES */}
					<BackgroundImages />

					{/* HEADER SECTION */}
					<HeaderComponent />

					{/* CONTENT SECTION */}
					<div className="content" ref={listRef}>
						{loading ? (
							<div></div>
						) : error ? (
							<NoContentFullscreen />
						) : currentFullscreenSection === FullscreenSections.Home ? (
							<HomeView />
						) : currentFullscreenSection ===
						  FullscreenSections.Collections ? (
							<ShowsView listRef={listRef}/>
						) : currentFullscreenSection ===
						  FullscreenSections.Details ? (
							<DetailsView />
						) : (
							<NoContentFullscreen />
						)}
					</div>
				</>
			)}
		</>
	);
}

export default MainFullscreen;
