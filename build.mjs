import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";
import { brandsNames,getThemeNames,configFile, getCompsNames } from "./config.mjs";

register(StyleDictionary);

// Transforma o valor "AUTO" em "space-between"
StyleDictionary.registerTransform({
  type: 'value',
  name: 'auto-space-between',
  filter: (token) => token.type === 'spacing' && token.value === 'AUTO',
  transform: () => 'space-between',
});

StyleDictionary.registerTransform({
  type: 'value',
  name: 'font-transform-none',
  filter: (token) => token.type === 'textCase' && token.value === 'astyped',
  transform: () => 'none',
});

//Cria formatador de variables para JS

const JSVariables = {
  customFormat: function ({ dictionary, options }) {
    return dictionary.allTokens
      .map((token) => {
        let value = JSON.stringify(token.value);
        if (options.outputReferences) {
          if (dictionary.usesReference(token.original.value)) {
            const refs = dictionary.getReferences(token.original.value);
            refs.forEach((ref) => {
              value = value.replace(ref.value, function () {
                return `${ref.name}`;
              });
            });
          }
        }

        return `export const ${token.name} = ${value};`;
      })
      .join(`\n`);
  },
};

StyleDictionary.registerFormat({
  name: 'jsVariables',
  format: JSVariables.customFormat,
});


//Gera a paste de tokens globais, consumida por todos os times

const Global = new StyleDictionary({
  source: ["figma/G_BASE/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "dist/css/",
      files: [
        {
          filter: (token) =>
            token.filePath.includes(`figma/G_BASE/Foundations.json`),
          destination: "global.css",
          format: "css/variables",
        },
      ],
    },
    scss: {
      transformGroup: "scss",
      buildPath: "dist/scss/",
      files: [
        {
          filter: (token) =>
            token.filePath.includes(`figma/G_BASE/Foundations.json`),
          destination: "global.scss",
          format: "scss/variables",
        },
      ],
    },
  },
});

await Global.cleanAllPlatforms();
await Global.buildAllPlatforms();

brandsNames.forEach(function (brand) {
    const themesNames = getThemeNames(".", brand);
    themesNames.forEach(function (themes) {
        const compsNames = getCompsNames(".", brand);
        compsNames.forEach(function (comp) {

        console.log('\n==============================================');
        console.log(`\nProcessing: [${themes}] [${brand}] [${comp}]`);
  
        const brandsThemes = new StyleDictionary(configFile(brand, themes, comp));
        brandsThemes.log.verbose = true; // Define o nível de log como 'verbose'
        brandsThemes.log.errors.brokenReferences = 'throw'; // Trata referências quebradas como erros
  
        brandsThemes.cleanAllPlatforms();
        brandsThemes.buildAllPlatforms();
    });
    });
});