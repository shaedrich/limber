import { importSync } from '@embroider/macros';

import babelPluginEmberTemplateCompilation from 'babel-plugin-ember-template-compilation';

import type { Babel } from './types.ts';

const compiler = importSync('ember-source/dist/ember-template-compiler.js');

let processor: any;
let fetchingPromise: Promise<any>;

export async function preprocess(input: string, name: string): Promise<string> {
  if (!fetchingPromise) {
    fetchingPromise = import('content-tag');
  }

  if (!processor) {
    let { Preprocessor } = await fetchingPromise;

    processor = new Preprocessor();
  }

  return processor.process(input, `${name}.js`);
}

export async function transform(
  intermediate: string,
  name: string,
  options: any = {}
): Promise<ReturnType<Babel['transform']>> {
  let babel = (await import('@babel/standalone')) as Babel;

  return babel.transform(intermediate, {
    filename: `${name}.js`,
    plugins: [
      // [babelPluginIntermediateGJS],
      [
        babelPluginEmberTemplateCompilation,
        {
          compiler,
        },
      ],
      [babel.availablePlugins['proposal-decorators'], { legacy: true }],
      [babel.availablePlugins['proposal-class-properties']],
    ],
    presets: [
      [
        babel.availablePresets['env'],
        {
          // false -- keeps ES Modules
          modules: 'cjs',
          targets: { esmodules: true },
          forceAllTransforms: false,
          ...options,
        },
      ],
    ],
  });
}
