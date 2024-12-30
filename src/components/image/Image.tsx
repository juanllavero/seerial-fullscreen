import { useDataContext } from "context/data.context";
import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

interface ImageProps {
	id?: string;
	src: string;
	alt: string;
	width?: number;
	height?: number;
	style?: React.CSSProperties;
	errorSrc: string;
	isRelative: boolean;
	className?: string;
	onLoad?: (e?: any) => void;
}

function Image({
	id,
	src,
	alt,
	width,
	height,
	style,
	errorSrc,
	isRelative,
	className,
	onLoad,
}: ImageProps) {
	const { serverIP } = useDataContext();
	return (
		<>
			{isRelative ? (
				<LazyLoadImage
					id={id && id}
					src={
						src.startsWith("http")
							? src
							: `https://${serverIP}/${src}`
					}
					alt={alt}
					style={{
						width: width ? `${width}px` : undefined,
						height: height ? `${height}px` : undefined,
						...style,
					}}
					onError={(e: any) => {
						e.target.onerror = null; // To avoid infinite loop
						e.target.src = errorSrc;
					}}
					className={className || ""}
					onLoad={onLoad}
				/>
			) : (
				<LazyLoadImage
					id={id && id}
					src={src}
					alt={alt}
					style={{
						width: `${width}px`,
						height: `${height}px`,
					}}
					onError={(e: any) => {
						e.target.onerror = null; // To avoid infinite loop
						e.target.src = errorSrc;
					}}
					className={className || ""}
					onLoad={onLoad}
				/>
			)}
		</>
	);
}

export default React.memo(Image);
