import fs from 'fs';
import { CommandRunner } from 'ts-script';
import { getKoboldEndpointUrl } from '../util/url';

console.log('--- Generating Type Definition ---');

const url = getKoboldEndpointUrl();

fetchVersion().then(() => {
	fetchDefinition();
	createSpecFile();
});

async function fetchVersion() {
	const version = await fetch(`${url.href}v1/info/version`).then((e) =>
		e.json()
	);
	console.log(
		`--- Generating Definition for Version ${(version as { result: string }).result} ---`
	);
}

async function fetchDefinition() {
	console.log(
		'--- Warning, cannot fetch at the moment definition due to Kobold Bug, please visit url manually and copy the json in ---'
	);
	let definition = await fetch(`${url.href}?json=1`).then((e) => e.text());
	console.log(definition);
	return true;

	fs.writeFileSync(__dirname + '/schema.json', definition);
	return true;
}

async function createSpecFile() {
	console.log('--- Generating Definition TS Files ---');
	const cmd = new CommandRunner();

	await cmd.runAsync(
		`npx openapi-typescript ${__dirname + '/schema.json'} -o ${__dirname + '/koboldCppDefinition.ts'}`,
		{
			loadingDescription: 'Preparing',
			finishedDescription: 'Prepared',
		}
	);

	console.log('--- Finished generation Definitions! ---');
}
