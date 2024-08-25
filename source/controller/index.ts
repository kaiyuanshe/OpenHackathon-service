import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { isProduct } from '../utility';
import { BaseController } from './Base';
import { UserController } from './User';
import { OauthController } from './OAuth';
import { ActivityLogController } from './ActivityLog';
import { HackathonController } from './Hackathon';
import { StaffController } from './Staff';
import { OrganizerController } from './Organizer';
import { EnrollmentController } from './Enrollment';
import { TeamController } from './Team';

export * from './Base';
export * from './User';
export * from './OAuth';
export * from './ActivityLog';
export * from './Hackathon';
export * from './Staff';
export * from './Organizer';
export * from './Enrollment';
export * from './Team';

export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers: [
        OauthController,
        UserController,
        ActivityLogController,
        StaffController,
        OrganizerController,
        EnrollmentController,
        TeamController,
        HackathonController,
        BaseController
    ]
});
