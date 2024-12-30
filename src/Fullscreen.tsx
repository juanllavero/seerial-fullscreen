import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import MainFullscreen from "./windows/fullscreen/MainFullscreen";
import { store } from "./redux/store";
import "./Fullscreen.scss";
import { SectionProvider } from "context/section.context";
import { FullscreenProvider } from "context/fullscreen.context";
import { DataProvider } from "context/data.context";
import { WebSocketsProvider } from "context/ws.context";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<Provider store={store}>
		<FullscreenProvider>
			<SectionProvider>
				<DataProvider>
					<WebSocketsProvider>
						<MainFullscreen />
					</WebSocketsProvider>
				</DataProvider>
			</SectionProvider>
		</FullscreenProvider>
	</Provider>
);
