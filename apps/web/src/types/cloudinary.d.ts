declare module "@cloudinary/url-builder" {
	export interface CloudinaryConfig {
		cloud: {
			cloudName: string;
		};
		url?: {
			secure?: boolean;
		};
	}

	export class Cloudinary {
		constructor(config: CloudinaryConfig);
		image(publicId: string): unknown;
	}
}
