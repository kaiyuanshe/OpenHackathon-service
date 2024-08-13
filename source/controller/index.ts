import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { isProduct } from '../utility';
import { UserController } from './User';
import { OauthController } from './OAuth';
import { ActivityLogController } from './ActivityLog';
import { HackathonController } from './Hackathon';
import { StaffController } from './Staff';
import { EnrollmentController } from './Enrollment';

export * from './User';
export * from './OAuth';
export * from './ActivityLog';
export * from './Hackathon';
export * from './Staff';
export * from './Enrollment';

export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers: [
        OauthController,
        UserController,
        ActivityLogController,
        EnrollmentController,
        HackathonController,
        StaffController
    ]
});
