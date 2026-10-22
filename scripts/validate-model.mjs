import { readFile, writeFile } from 'node:fs/promises';
import { validateBytes } from 'gltf-validator';

const file = new URL('../public/models/mellon.glb', import.meta.url);
const bytes = await readFile(file);
const report = await validateBytes(new Uint8Array(bytes), { uri: 'mellon.glb', maxIssues: 100 });
await writeFile(new URL('../assets/previews/gltf-validation.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ bytes: bytes.length, issues: report.issues, info: report.info }, null, 2));
if (bytes.length > 8 * 1024 * 1024 || report.issues.numErrors || report.issues.numWarnings) process.exitCode = 1;
