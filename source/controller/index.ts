import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { isProduct } from '../utility';
import { UserController } from './User';
import { ActivityLogController } from './ActivityLog';
import { HackathonController } from './Hackathon';
import { StaffController } from './Staff';
import { EnrollmentController } from './Enrollment';

export * from './User';
export * from './ActivityLog';
export * from './Hackathon';
export * from './Staff';
export * from './Enrollment';

export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers: [
        UserController,
        ActivityLogController,
        EnrollmentController,
        HackathonController,
        StaffController
    ]
});
