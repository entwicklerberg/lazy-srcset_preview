import fs from 'fs/promises';
import path from 'path';

const IMG_DIR = path.resolve('img');
const OUTPUT_FILE = path.resolve('images.js');

async function main() {
    const entries = await fs.readdir(IMG_DIR, {
        withFileTypes: true,
    });

    const folders = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort();

    const content = `export const images = ${JSON.stringify(
        folders,
        null,
        2
    )};\n`;

    await fs.writeFile(OUTPUT_FILE, content);

    console.log(
        `Generated ${OUTPUT_FILE} with ${folders.length} folders`
    );
}

main().catch(console.error);