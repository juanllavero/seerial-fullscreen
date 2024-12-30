import React, { useContext, useEffect } from "react";

interface DataContextProps {
	serverIP:string;
	setServerIP: (ip: string) => void;
	serverStatus: boolean;
	gettingServerStatus: boolean;
	apiKeyStatus: boolean;
	gettingApiKeyStatus: boolean;
	getServerStatus: () => void;
	setApiKey: (apiKey: string) => void;
}

export const DataContext = React.createContext<DataContextProps | undefined>(
	undefined
);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
	const [serverIP, setServerIP] = React.useState<string>("");
	const [serverStatus, setServerStatus] = React.useState<boolean>(false);
	const [gettingServerStatus, setGettingServerStatus] =
		React.useState<boolean>(false);
	const [apiKeyStatus, setApiKeyStatus] = React.useState<boolean>(false);
	const [gettingApiKeyStatus, setGettingApiKeyStatus] =
		React.useState<boolean>(false);

	// Check server status and api key status every time the currentServer changes
	useEffect(() => {
		getServerStatus();
	}, [serverIP]);

	// Check server status and api key status
	const getServerStatus = async () => {
		if (serverIP === "") return;

		setGettingServerStatus(true);

		// Promise that rejects after 10 seconds
		const timeoutPromise = new Promise((_, reject) =>
			setTimeout(
				() => reject(new Error("Timeout: The request took too long")),
				10000
			)
		);

		// Fetch server status
		const fetchPromise = fetch(`https://${serverIP}/`).then(
			(response) => response.json()
		);

		try {
			// Cancel fetch if 10 seconds pass
			const data = await Promise.race([fetchPromise, timeoutPromise]);

			setServerStatus(data.status != undefined);

			setApiKeyStatus(data.status === "VALID_API_KEY");
			setGettingApiKeyStatus(false);
		} catch (error) {
			setServerStatus(false);
		} finally {
			setGettingServerStatus(false);
		}
	};

	// Set api key in server
	const setApiKey = async (apiKey: string) => {
		if (serverIP === "") return;

		setGettingApiKeyStatus(true);
		const response = await fetch(`https://${serverIP}/api-key`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ apiKey: apiKey }),
		});
		const data = await response.json();

		setApiKeyStatus(data.status === "VALID_API_KEY");
		setGettingApiKeyStatus(false);
	};

	return (
		<DataContext.Provider
			value={{
				serverIP,
				setServerIP,
				serverStatus,
				gettingServerStatus,
				apiKeyStatus,
				gettingApiKeyStatus,
				getServerStatus,
				setApiKey,
			}}
		>
			{children}
		</DataContext.Provider>
	);
};

// Custom hook to use the DataContext
export const useDataContext = (): DataContextProps => {
	const context = useContext(DataContext);
	if (context === undefined) {
		throw new Error("useDataContext must be used within a DataProvider");
	}
	return context;
};
