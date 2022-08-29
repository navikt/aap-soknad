import pino from 'pino';
import ecsFormat from '@elastic/ecs-pino-format';

const localhostLogger = pino({
  browser: {},
  level: 'debug',
  timestamp: false,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },

  base: {
    env: process.env.NODE_ENV,
  },
});

const ecsLogger = pino(ecsFormat());

const logger = process.env.NEXT_PUBLIC_ENVIRONMENT === 'localhost' ? localhostLogger : ecsLogger;

export default logger;
