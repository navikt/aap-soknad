import pino from 'pino';
import ecsFormat from '@elastic/ecs-pino-format';

const ecsLogger = pino(ecsFormat());

export default ecsLogger;
