import fs from 'fs/promises';
import { SøknadsType } from 'utils/api';

export const lesCache = async () => {
  try {
    return await fs.readFile('.bucket.cache', 'utf8');
  } catch (err: any) {
    if (err.code === 'ENOENT') return await fs.writeFile('.bucket.cache', '');
    else return undefined;
  }
};

export const lagreCache = async (data: string) => {
  await fs.writeFile('.bucket.cache', data);
  return true;
};

export const deleteCache = async () => {
  await fs.unlink('.bucket.cache');
  return;
};
