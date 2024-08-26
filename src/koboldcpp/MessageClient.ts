import { v4 as uuidv4 } from 'uuid';
import { components } from '../generated/koboldCppDefinition';
import KoboldCpp from '../Koboldcpp';
import { ChunkStreamResponseCallback } from './streamingUtil';
import { StrictOmit } from '../util/types';

export type GenerationConfig = StrictOmit<
	components['schemas']['GenerationInput'],
	'genkey' | 'prompt'
>;

export class MessageClient {
	constructor(koboldCppInstance: KoboldCpp, baseConfig: GenerationConfig) {
		this.koboldCppInstance = koboldCppInstance;
		this.#baseConfig = baseConfig as GenerationConfig;
	}
	#genkey: string = uuidv4();
	get genkey() {
		return this.#genkey;
	}
	#baseConfig: GenerationConfig;

	koboldCppInstance: KoboldCpp;
	async generate(prompt: string, config: Partial<GenerationConfig> = {}) {
		const reqObj = {
			body: {
				...this.#baseConfig,
				...config,
				genkey: this.#genkey,
				prompt: prompt,
			},
		};
		return this.koboldCppInstance.generate(reqObj);
	}
	async stream(
		prompt: string,
		callback: ChunkStreamResponseCallback,
		config: Partial<GenerationConfig> = {}
	) {
		const reqObj = {
			body: {
				...this.#baseConfig,
				...config,
				genkey: this.#genkey,
				prompt: prompt,
			},
		};
		return this.koboldCppInstance.generateStream(reqObj, callback);
	}
	async check() {
		return this.koboldCppInstance.generateCheck({
			genkey: this.#genkey,
		});
	}
	async abort() {
		return this.koboldCppInstance.generateAbort({
			genkey: this.#genkey,
		});
	}
}
