"use client";

import { AdvancedImage } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";

// Initialize with explicit typing
const cld = new Cloudinary({
	cloud: {
		cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string,
	},
});

interface CloudinaryImageProps {
	publicId: string;
	alt: string;
	className?: string;
	width?: number;
	height?: number;
}

export default function CloudinaryImage({
	publicId,
	alt,
	className,
	width = 800,
	height = 600,
}: CloudinaryImageProps) {
	// Create the image instance with proper typing
	const img = cld.image(publicId);

	// Apply transformations
	img.resize(fill().width(width).height(height));

	return <AdvancedImage cldImg={img} alt={alt} className={className} />;
}
