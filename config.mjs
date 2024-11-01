import fs from "fs";
import _ from "lodash";
import path from "path";
import { fileURLToPath } from "url";

//Mapeia todas as pastas de primeiro nível em BRANDS, com exceção de PATTERNS

function getBrandsNames(rootFolderPath) {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirPath = path.dirname(currentFilePath);
  const brandsFolderPath = "./figma/BRANDS";

  try {
    //Filtro prara incluir apenas diretórios que não se chamam PATTERNS
    const subfolders = fs
      .readdirSync(path.join(currentDirPath, brandsFolderPath), {
        withFileTypes: true,
      })
      .filter((dirent) => dirent.isDirectory() && dirent.name !== "PATTERNS");

    //Mapeia os nomes dos diretórios
    const subfolderNames = subfolders.map((dirent) => dirent.name);
    return subfolderNames;
  } catch (error) {
    console.error("Error reading folder:", error);
    return [];
  }
}



const brandsNames = getBrandsNames(".");
console.log("Marcas:", brandsNames);

//Mapeamento de temas que existem dentro da pasta THEMES de cada marca

function getThemeNames(rootFolderPath, brand) {
  try {
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDirectoryPath = path.dirname(currentFilePath);
    const brandsFolderPath = `./figma/BRANDS/${brand}/THEMES`;

    const folderNames = fs
      .readdirSync(path.join(currentDirectoryPath, brandsFolderPath), {
        withFileTypes: true,
      })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    return folderNames;
  } catch (error) {
    console.error("Error reading folder:", error);
    return [];
  }
}

//Mapeamento de componentes que existem tanto nas pastas COMPS de cada marca, quanto na G_COMPS
function getCompsNames(rootFolderPath, brand) {
    try {
      const currentFilePath = fileURLToPath(import.meta.url);
      const currentDirectoryPath = path.dirname(currentFilePath);
      const brandCompsFolderPath = `./figma/BRANDS/${brand}/COMPS`;
      const generalCompsFolderPath = './figma/G_COMPS';
  
      // Lê os nomes dos arquivos de todas as pastas
      const brandFileNames = fs
        .readdirSync(path.resolve(currentDirectoryPath, brandCompsFolderPath))
        .filter((file) => file.endsWith('.json'))
        .map((file) => path.parse(file).name);
  
      const generalFileNames = fs
        .readdirSync(path.resolve(currentDirectoryPath, generalCompsFolderPath))
        .filter((file) => file.endsWith('.json'))
        .map((file) => path.parse(file).name);
  
      // Combina os nomes e remove duplicatas usando um Set
      const uniqueFileNames = new Set([...brandFileNames, ...generalFileNames]);
  
      // Converte o Set de volta para um array
      return Array.from(uniqueFileNames);
    } catch (error) {
      console.error('Error reading folder:', error);
      return [];
    }
  }



// Configuração dos arquivos de tokens que serão gerados pelo builder

function configFile(brand, themes, comp) {
  if (!brand) {
    console.error("Brand not defined");
    return;
  }

  const brandThemePath = `figma/BRANDS/${brand}/THEMES/${themes}`;

  const selector = `html${
    themes ==="DARK"
        ? "[data-theme='dark']"
        : ":root, html[data-theme= 'light']"
  }`;

  return {
    source: [
      `figma/G_BASE/*.json`,
      `figma/BRANDS/${brand}/BASE/*.json`,
      `${brandThemePath}/*.json`,
      `figma/BRANDS/PATTERNS/*.json`,
      `figma/BRANDS/${brand}/COMPS/${comp}.json`,
      `figma/G_COMPS/${comp}.json`
    ],
    preprocessors: ["tokens-studio"],
    platforms: {
      //Gera arquivos em CSS
      css: {
        buildPath: `dist/css/`, // Pasta onde os arquivos serão criados
        transformGroup: "tokens-studio",
        transforms: ["name/kebab"],
        files: [

          {
            filter: (token) =>
              token.filePath.includes(`${brandThemePath}/Illustrations.json`) ||
              token.filePath.includes(`${brandThemePath}/Shadows`) ||
              token.filePath.includes(`PATTERNS/Backgrounds.json`) ||
              token.filePath.includes(`PATTERNS/Foregrounds.json`) ||
              token.filePath.includes(`PATTERNS/Borders.json`) ||
              token.filePath.includes(`PATTERNS/States.json`),
            destination: `${brand.toLowerCase()}/${themes.toLowerCase()}.css`,
            format: "css/variables",
            options:{
                selector: selector
            }
          },
          {
            filter: (token) =>
              token.filePath.includes(`Typeset.json`),
            destination: `${brand.toLowerCase()}/typeset.css`,
            format: "css/variables",
          },
          {
            filter: (token) =>
              token.filePath.includes(`Typography.json`),
            destination: `/typography.css`,
            format: "css/variables",
            options:{
                outputReferences: true //preserva a referencia
            }
          },
          {
            filter: (token) =>
              token.filePath.includes(`PATTERNS/Shadows.json`),
            destination: `/shadows.css`,
            format: "css/variables",
            options:{
                outputReferences: true //preserva a referencia
            }
          },
          {
            filter: (token) =>
              token.filePath.includes(`COMPS`) ||
            token.filePath.includes(`G_COMPS`),
            destination: `${brand.toLowerCase()}/comps/${comp.toLowerCase()}.css`,
            format: "css/variables",
          },
        ],
      },
      scss: {
        buildPath: `dist/scss/`, // Pasta onde os arquivos serão criados
        transformGroup: "tokens-studio",
        transforms: ["name/kebab", "auto-space-between", "font-transform-none"],
        files: [

          {
            filter: (token) =>
              token.filePath.includes(`${brandThemePath}/Illustrations.json`) ||
              token.filePath.includes(`${brandThemePath}/Shadows`) ||
              token.filePath.includes(`PATTERNS/Backgrounds.json`) ||
              token.filePath.includes(`PATTERNS/Foregrounds.json`) ||
              token.filePath.includes(`PATTERNS/Borders.json`) ||
              token.filePath.includes(`PATTERNS/States.json`),
            destination: `${brand.toLowerCase()}/${themes.toLowerCase()}.scss`,
            format: "scss/variables",
            options:{
                selector: selector
            }
          },

          {
            filter: (token) =>
              token.filePath.includes(`Typeset.json`),
            destination: `${brand.toLowerCase()}/typeset.scss`,
            format: "scss/variables",
          },
          {
            filter: (token) =>
              token.filePath.includes(`Typography.json`),
            destination: `/typography.scss`,
            format: "scss/variables",
            options:{
                outputReferences: true //preserva a referencia
            }
          },
          {
            filter: (token) =>
              token.filePath.includes(`PATTERNS/Shadows.json`),
            destination: `/shadows.scss`,
            format: "scss/variables",
            options:{
                outputReferences: true //preserva a referencia
            }
          },
          {
            filter: (token) =>
              token.filePath.includes(`COMPS`) ||
            token.filePath.includes(`G_COMPS`),
            destination: `${brand.toLowerCase()}/comps/${comp.toLowerCase()}.scss`,
            format: "scss/variables",
          },
        ],
      },
    },
  };
}

export {brandsNames, getThemeNames, configFile, getCompsNames}