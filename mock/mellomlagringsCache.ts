import NodeCache from 'node-cache';
import { SøknadsType } from '../utils/api';

const mellomlagringsCache = new NodeCache({ stdTTL: 60 * 60 * 24 * 30 });

export const lesCache = async (type: SøknadsType) => {
  return await mellomlagringsCache.get(type);
};

export const lagreCache = async (type: SøknadsType, data: any) => {
  return mellomlagringsCache.set(type, data);
};

export const deleteCache = async (type: SøknadsType) => {
  return mellomlagringsCache.del(type);
};
