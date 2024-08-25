import dotenv from 'dotenv';
dotenv.config();

export function getKoboldEndpointUrl(): URL {
	let rawUrl = process.env['KOBOLD_ENDPOINT']! ?? '';

	let url: URL;
	try {
		url = new URL(rawUrl!);
	} catch (error) {
		console.log('--- ERROR ---');
		if ((error as any)?.code === 'ERR_INVALID_URL') {
			console.log(
				'You forgot to set a valid URL for the KOBOLD_ENDPOINT'
			);
			throw error;
		}
		console.error(error);
		throw error;
	}

	return new URL(url.origin + '/api/');
}
