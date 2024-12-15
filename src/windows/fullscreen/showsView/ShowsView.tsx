import "../../../i18n";
import { RootState } from "@redux/store";
import { useDispatch, useSelector } from "react-redux";
import ShowsCard from "./ShowsCard";
import { useEffect } from "react";
import { selectSeries } from "@redux/slices/dataSlice";

function ShowsView({ listRef }: { listRef: React.RefObject<HTMLDivElement> }) {
	const dispatch = useDispatch();
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);

	useEffect(() => {
		if (
			selectedLibrary &&
			selectedLibrary.series &&
			selectedLibrary.series.length > 0
		)
			dispatch(selectSeries(selectedLibrary.series[0]));
	}, [selectedLibrary]);

	return (
		<div className="shows-container">
			{selectedLibrary &&
				selectedLibrary.series.map((element, index) => (
					<ShowsCard
						element={element}
						index={index}
						key={element.id}
						listRef={listRef}
					/>
				))}
		</div>
	);
}

export default ShowsView;
