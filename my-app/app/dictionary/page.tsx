export const runtime = 'nodejs';

import { promises as fs } from 'fs';
import path from 'path';
import { lessonConfigs } from '@/data/lessons/lessonConfigs';
import DictionaryClient from './DictionaryClient';

// --- TYPES ---
export type SignData = {
  name: string;
  category: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  wordKey: string;
};

const IMAGE_EXTENSIONS = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm']);

// Build mediaSrc → wordKey map from all lesson vocab configs
function buildWordKeyMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const config of Object.values(lessonConfigs)) {
    for (const item of config.vocab) {
      map[item.mediaSrc] = item.key;
    }
  }
  return map;
}

async function scanFolder(
  root: string,
  urlBase: string,
  mediaType: 'image' | 'video',
  validExts: Set<string>,
  signs: SignData[],
  wordKeyMap: Record<string, string>
) {
  let categoryDirs: string[] = [];
  try {
    categoryDirs = await fs.readdir(root);
  } catch { return; }

  for (const cat of categoryDirs) {
    const catPath = path.join(root, cat);
    const stat = await fs.stat(catPath).catch(() => null);
    if (!stat?.isDirectory()) continue;

    const category = cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    let files: string[] = [];
    try {
      files = await fs.readdir(catPath);
    } catch { continue; }

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!validExts.has(ext)) continue;

      const baseName = path.basename(file, ext);
      const name = baseName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const mediaSrc = `${urlBase}/${cat}/${file}`;

      // Derive wordKey: use lesson config map first, then fall back by category
      let wordKey = wordKeyMap[mediaSrc];
      if (!wordKey) {
        if (cat === 'letters') wordKey = `letter_${baseName.toLowerCase()}`;
        else if (cat === 'numbers') wordKey = `num_${baseName}`;
        else wordKey = `sign_${baseName.toLowerCase()}`;
      }

      signs.push({ name, category, mediaType, mediaSrc, wordKey });
    }
  }
}

async function getSigns(): Promise<SignData[]> {
  const signs: SignData[] = [];
  const publicDir = path.join(process.cwd(), 'public');
  const wordKeyMap = buildWordKeyMap();

  await scanFolder(path.join(publicDir, 'asl_videos'), '/asl_videos', 'video', VIDEO_EXTENSIONS, signs, wordKeyMap);
  await scanFolder(path.join(publicDir, 'asl_images'), '/asl_images', 'image', IMAGE_EXTENSIONS, signs, wordKeyMap);

  return signs;
}

export default async function DictionaryPage() {
  const allSigns = await getSigns();
  return <DictionaryClient allSigns={allSigns} />;
}
