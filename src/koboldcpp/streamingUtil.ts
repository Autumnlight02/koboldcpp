import { type ReadableStream } from 'stream/web';
const debug = false;

const textDecoder = new TextDecoder();
export async function processGenerateStream(
	stream: ReadableStream,
	callback: ChunkStreamResponseCallback
) {
	const reader = stream.getReader();

	const chunks: Uint8Array[] = [];
	let previousLeft: Uint8Array | undefined;
	while (true) {
		const { done, value: valueBuffer } = (await reader.read()) as {
			done: boolean;
			value: Uint8Array;
		};
		if (done) {
			return { done };
		}
		let chunkStart = 0;
		if (debug) {
			console.log(' >>>new Iteration<<<');
			console.log(textDecoder.decode(valueBuffer));
			console.log(' >>>Login:<<<');
		}

		for (let i = 0; i < valueBuffer.length; i++) {
			if (valueBuffer[i] === 10) {
				if (valueBuffer[i + 1] === 10) {
					// we know a lineBreak
					if (previousLeft !== undefined) {
						if (debug) {
							console.log('-- string --');
							console.log(textDecoder.decode(previousLeft));
							console.log('-- line --');

							console.log(textDecoder.decode(valueBuffer));
						}
						const newIntArr = new Uint8Array(
							//TODO veriy if math is mathing
							previousLeft.length + (i - chunkStart)
						);
						newIntArr.set(previousLeft);
						newIntArr.set(
							valueBuffer.slice(chunkStart, i),
							previousLeft.length
						);
						if (debug) {
							console.log('-- combined --');

							console.log(textDecoder.decode(newIntArr));
						}
						chunks.push(newIntArr);
						previousLeft = undefined;
						chunkStart = i;
					}
					else {
						if (debug) {
							console.log('>>>>>>> FOUND <<<<<<<<<<');
							console.log(
								textDecoder.decode(
									valueBuffer.slice(chunkStart, i)
								)
							);
							console.log('>>>>>>> LEFT <<<<<<<<<<');
						}
						chunks.push(valueBuffer.slice(chunkStart, i));
						chunkStart = i + 2;
						textDecoder.decode(
							valueBuffer.slice(chunkStart, valueBuffer.length)
						);
					}
				}
			}
		}
		if (chunkStart !== valueBuffer.length) {
			previousLeft = valueBuffer.slice(chunkStart);
		}
		if (debug) {
			console.log(chunkStart, valueBuffer.length);
		}
		// processing found chunks
		for (let i = 0; i < chunks.length; i++) {
			const currentChunk = chunks[i];
			callback(processChunk(currentChunk));
		}
		chunks.length = 0;
	}
}

//TODO find other types for finish reason like abort
function processChunk(intArr: Uint8Array): ChunkStreamResponse {
	const eventTypeStartInded = 7; // at :
	const eventTypeEndIndex = intArr.indexOf(10, eventTypeStartInded); // find \n
	const eventTypeBuffer = intArr.slice(
		eventTypeStartInded,
		eventTypeEndIndex
	);
	const eventType = textDecoder.decode(eventTypeBuffer);
	// " " (space) is 32
	//Jump over data: text directly to json start
	const dataStart = eventTypeEndIndex + 7;
	const dataEnd = intArr.length;
	const dataBuffer = intArr.slice(dataStart, dataEnd);
	const dataString = textDecoder.decode(dataBuffer);

	// console.log('--');
	// console.log(textDecoder.decode(intArr));
	if (debug) {
		console.log('JSON');
		console.log(dataString);
		console.log('| -- datastring -- |');
		console.log(textDecoder.decode(intArr));
		console.log('>>>datastring END<<<');
	}
	return { event: eventType, data: JSON.parse(dataString) };
}

export interface ChunkStreamResponse {
	event: string;
	data: { token: string; finish_reason: 'null' | 'length' };
}

export type ChunkStreamResponseCallback = (data: ChunkStreamResponse) => void;
