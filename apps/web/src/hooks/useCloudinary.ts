import { useState } from "react";

export const useCloudinary = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const uploadImage = async (file: File) => {
		setLoading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("upload_preset", "presetUpload");

			const response = await fetch(
				`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
				{
					method: "POST",
					body: formData,
				},
			);

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			const data = await response.json();
			return data.secure_url;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed");
			throw err;
		} finally {
			setLoading(false);
		}
	};

	return { uploadImage, loading, error };
};
