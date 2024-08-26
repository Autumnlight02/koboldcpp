# KoboldCpp Node API Library

This library provides easy access to the KoboldCpp REST API from TypeScript or JavaScript.
It Includes a KoboldCppDirectClient for raw Access to the API or an KoboldCpp Client for easy access.

[![NPM version](https://img.shields.io/npm/v/koboldcpp.svg)](https://npmjs.org/package/koboldcpp) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/koboldcpp)

If you would like to check out the automatic generated Documentation visit
[here](https://autumnlight02.github.io/koboldcpp/classes/default.html#generateCheck).

## Installation
 
```sh
npm install koboldcpp
```

```ts
import KoboldCpp from "koboldcpp";
```

Visit [KoboldCpp](https://github.com/LostRuins/koboldcpp) to run your own Local LLM Backend.

## Usage

Using it with the MessageClient (Recommended)
```ts
import KoboldCpp from "koboldcpp";

const KoboldCppInstance = new KoboldCpp({
  baseUrl: "http://MyKoboldCppUrl.com",
});

const client = KoboldCppInstance.createMessageClient({
  bypass_eos: false,
  dynatemp_exponent: 1,
  dynatemp_range: 1,
  grammar_retain_state: false,
  trim_stop: true,
  smoothing_factor: 1,
  logit_bias: {},
  render_special: true,
  use_default_badwordsids: false,
});

async function main() {
  console.log(
    `Running Version ${KoboldCppInstance.getSimplifiedVersion()} With Model ${KoboldCppInstance.getModel()}.`
  );

  const message = await client.generate("Hello, how are you");
  console.log(message);
}

main();
```

Using the Api without Message Client
```ts
import KoboldCpp from "koboldcpp";

const KoboldCppInstance = new KoboldCpp({
  baseUrl: "http://MyKoboldCppUrl.com",
});

async function main() {
  const message = await KoboldCppInstance.generate({
    body: { prompt: "test", genkey: "myCustomKey" },
  });
}

main();
```

## Streaming Responses

```ts
const KoboldCppInstance = new KoboldCpp({
  baseUrl: "http://MyKoboldCppUrl.com",
});

async function main() {
  const streamend = await KoboldCppInstance.generateStream(
    {
      body: { prompt: "test", genkey: "myCustomKey" },
    },
    (chunk) => {
      console.log(chunk.data);
    }
  );
}

main();
```

Check the [Docs](https://autumnlight02.github.io/koboldcpp/classes/default.html#generateCheck) for all other Methods. On feature / Documentation request open an Issue!

## Contributing & Development

See [contributing.md](docs/contributing/contributing.md) for information on how to develop or contribute to this project!
