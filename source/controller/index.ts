import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { isProduct } from '../utility';
import { UserController } from './User';
import { HackathonController } from './Hackathon';
import { EnrollmentController } from './Enrollment';

export * from './User';
export * from './Hackathon';
export * from './Enrollment';

export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers: [UserController, EnrollmentController, HackathonController]
});
