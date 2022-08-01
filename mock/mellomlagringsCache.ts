import fs from 'fs/promises';
import { SøknadsType } from '../utils/api';

export const lesCache = async () => {
  try {
    const data = await fs.readFile('.bucket.cache', 'utf8');
    return data;
  } catch (err) {
    console.log('err', err);
    return undefined;
  }
};

export const lagreCache = async (data: string) => {
  await fs.writeFile('.bucket.cache', data);
  return true;
};

export const deleteCache = async (type: SøknadsType) => {
  await fs.unlink('.bucket.cache');
  return;
};
