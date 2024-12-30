import { useTranslation } from "react-i18next";
import "./NoContent.scss";

function NoContent() {
	const { t } = useTranslation();
	return <div className="no-content">{t("noLibraryFound")}</div>;
}

export default NoContent;
