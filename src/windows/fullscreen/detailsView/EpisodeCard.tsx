import Image from "@components/image/Image";
import { ReactUtils } from "@data/utils/ReactUtils";
import { EpisodeData } from "@interfaces/EpisodeData";
import { selectEpisode } from "@redux/slices/dataSlice";
import { RootState } from "@redux/store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

function EpisodeCard({ episode, index, listRef }: { episode: EpisodeData, index: number, listRef: React.RefObject<HTMLDivElement> }) {
	const dispatch = useDispatch();
  const currentEpisode = useSelector(
		(state: RootState) => state.data.selectedEpisode
	);

	return (
		<div
			className={`element ${
				episode === currentEpisode ? "element-selected" : null
			}`}
			key={episode.id}
			onClick={() => {
        dispatch(selectEpisode(episode));
				ReactUtils.handleScrollElementClick(index, listRef, false);
			}}
		>
			{episode.imgSrc !== "" ? (
				<Image
					src={episode.imgSrc}
					alt="Poster"
					isRelative={true}
					errorSrc="/img/songDefault.png"
				/>
			) : (
				<Image
					src="/img/songDefault.png"
					isRelative={true}
					alt="Poster"
					errorSrc=""
				/>
			)}
		</div>
	);
}

export default React.memo(EpisodeCard);
