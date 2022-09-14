import pino from 'pino';
import ecsFormat from '@elastic/ecs-pino-format';

const ecsLogger = pino({
  ...ecsFormat(),
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

export default ecsLogger;
