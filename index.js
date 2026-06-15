import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const IMG_DIR = path.resolve('img');

const BREAKPOINTS = [
    1920,
    1440,
    1280,
    1024,
    768,
    640,
    480,
    320,
];

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function processFolder(folderPath) {
    const folderName = path.basename(folderPath);
    const files = await fs.readdir(folderPath);

    const fullFile = files.find(file => /^full\./i.test(file));

    if (!fullFile) {
        console.log(`Skip: ${folderName}, full.* not found`);
        return;
    }

    const originalPath = path.join(folderPath, fullFile);

    const baseWebpPath = path.join(folderPath, `${folderName}.webp`);

    if (!(await fileExists(baseWebpPath))) {
        await sharp(originalPath)
            .webp({ quality: 82 })
            .toFile(baseWebpPath);

        console.log(`${folderName}: created ${folderName}.webp`);
    }

    let inputPath = baseWebpPath;

    for (const width of BREAKPOINTS) {
        const outputPath = path.join(
            folderPath,
            `${folderName}-${width}.webp`
        );

        if (await fileExists(outputPath)) {
            inputPath = outputPath;
            continue;
        }

        await sharp(inputPath)
            .resize({
                width,
                withoutEnlargement: true,
            })
            .webp({ quality: 82 })
            .toFile(outputPath);

        console.log(`${folderName}: created ${folderName}-${width}.webp`);

        inputPath = outputPath;
    }

    await fs.unlink(originalPath);

    console.log(`${folderName}: deleted ${fullFile}`);
}

async function main() {
    const entries = await fs.readdir(IMG_DIR, {
        withFileTypes: true,
    });

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const folderPath = path.join(IMG_DIR, entry.name);

        await processFolder(folderPath);
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});