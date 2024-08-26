import createClient from 'openapi-fetch';
import type { components, paths } from './generated/koboldCppDefinition'; // generated by openapi-typescript
import {
	ChunkStreamResponseCallback,
	processGenerateStream,
} from './koboldcpp/streamingUtil';
import { MessageClient } from './koboldcpp/MessageClient';

//KoboldCppInstance
export default class KoboldCpp {
	direct: ReturnType<typeof createClient<paths>>;
	#baseUrl: string;
	get baseUrl() {
		return this.#baseUrl;
	}
	constructor(args: { baseUrl: string }) {
		this.#baseUrl = args.baseUrl;
		this.direct = createClient<paths>({ baseUrl: args.baseUrl });
	}

	async getMaxContextLength() {
		return this.direct
			.GET('/api/v1/config/max_context_length')
			.then((e) => e.data?.value);
	}
	async getMaxLength() {
		return this.direct
			.GET('/api/v1/config/max_length')
			.then((e) => e.data?.value);
	}
	async getTrueMaxLength() {
		return this.direct
			.GET('/api/extra/true_max_context_length')
			.then((e) => e.data?.value);
	}
	async getSimplifiedVersion() {
		return this.direct
			.GET('/api/v1/info/version')
			.then((e) => e.data?.result as string | undefined);
	}
	async getVersion() {
		return this.direct.GET('/api/extra/version').then((e) => e.data);
	}
	async getModel() {
		return this.direct
			.GET('/api/v1/model')
			.then((e) => e.data?.result as string | undefined);
	}
	async getPerf() {
		return this.direct.GET('/api/extra/perf').then((e) => e.data);
	}
	async generate(arg?: {
		body: Partial<components['schemas']['GenerationInput']>;
	}) {
		return this.direct
			.POST('/api/v1/generate', {
				body: (arg?.body ||
					{}) as components['schemas']['GenerationInput'],
			})
			.then((e) => e.data?.results ?? []);
	}
	async generateStream(
		arg: {
			body: Partial<components['schemas']['GenerationInput']>;
		},
		callback: ChunkStreamResponseCallback
	) {
		const cb =
			callback ??
			function (data) {
				console.log(data);
			};
		return this.direct
			.POST('/api/extra/generate/stream', {
				//even if parameters are missing the BE does not care
				body: arg.body as components['schemas']['GenerationInput'],
				parseAs: 'stream',
			})
			.then(async (res) => {
				// console.log(res.response); //TODO await fix so we get gentoken so we can have check and abort
				return await processGenerateStream(res.data!, cb);
			});
	}
	async generateCheck(arg?: { genkey?: string }) {
		return this.direct
			.POST('/api/extra/generate/check', {
				body: arg,
			})
			.then((e) => e.data?.results ?? []);
	}
	async generateAbort(arg: { genkey: string }) {
		return this.direct
			.POST('/api/extra/abort', {
				body: arg,
			})
			.then((e) => e.data!);
	}
	//TODO generate check ones
	async getTokenCount(text: string) {
		return this.direct
			.POST('/api/extra/tokencount', { body: { prompt: text } })
			.then((e) => e.data);
	}
	createMessageClient(
		config: ConstructorParameters<typeof MessageClient>[1]
	): MessageClient {
		return new MessageClient(this, config);
	}
}
