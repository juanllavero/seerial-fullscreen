import { useDataContext } from "context/data.context";
import React from "react";
import "./SetServerAndAPIKey.scss";

function SetServerAndAPIKey() {
	const { setServerIP, apiKeyStatus, serverStatus, setApiKey } =
		useDataContext();
	const [ip, setIP] = React.useState<string>("");
	const [apiKey, setApi] = React.useState<string>("");

	const handleClick = () => {
		if (!serverStatus) {
			setServerIP(ip);
		} else if (!apiKeyStatus) {
			setApiKey(apiKey);
		}
	};
	return (
		<div className="input-background">
			<div className="input-server">
				<span id="input-title">
					{!serverStatus
						? "Please enter your server IP and port"
						: "Please enter your API key"}
				</span>

				{!serverStatus ? (
					<input
						type="text"
						value={ip}
						placeholder="Ej: 192.168.1.30:3000"
						onChange={(e) => setIP(e.target.value)}
					/>
				) : (
					<input
						type="text"
						value={apiKey}
						onChange={(e) => setApi(e.target.value)}
					/>
				)}

				<button onClick={handleClick}>Continue</button>
			</div>
		</div>
	);
}

export default SetServerAndAPIKey;
