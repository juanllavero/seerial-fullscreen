import { useDispatch } from "react-redux";
import { useEffect, useRef } from "react";
import "../../i18n";
import "../../Fullscreen.scss";
import HomeView from "./homeView/HomeView";
import ShowsView from "./showsView/ShowsView";
import { useSectionContext } from "context/section.context";
import { FullscreenSections } from "@data/enums/Sections";
import NoContent from "./NoContent";
import HeaderComponent from "./HeaderComponent";
import BackgroundImages from "./BackgroundImages";
import DetailsView from "./detailsView/DetailsView";
import MainMenu from "./MainMenu";
import { selectLibrary, setLibraries } from "@redux/slices/dataSlice";
import Loading from "@components/utils/Loading";
import { LibraryData } from "@interfaces/LibraryData";
import useFetchArray from "hooks/useFetch";
import { useDataContext } from "context/data.context";
import SetServerAndAPIKey from "./inputServerAndAPI/SetServerAndAPIKey";

function MainFullscreen() {
	const dispatch = useDispatch();
	const { serverIP, serverStatus, apiKeyStatus } = useDataContext();
	const { data, loading, error } = useFetchArray<LibraryData>(
		`https://${serverIP}/libraries`
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
			{!serverStatus || !apiKeyStatus ? (
				<SetServerAndAPIKey />
			) : loading ? (
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
							<NoContent />
						) : currentFullscreenSection === FullscreenSections.Home ? (
							<HomeView />
						) : currentFullscreenSection ===
						  FullscreenSections.Collections ? (
							<ShowsView listRef={listRef} />
						) : currentFullscreenSection ===
						  FullscreenSections.Details ? (
							<DetailsView />
						) : (
							<NoContent />
						)}
					</div>
				</>
			)}
		</>
	);
}

export default MainFullscreen;
