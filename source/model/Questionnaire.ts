import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

import { HackathonBase } from './Hackathon';

export class Extension {
    @IsString()
    name: string;

    @IsString()
    value: string;
}

export class Questionnaire extends HackathonBase {
    @Type(() => Extension)
    @ValidateNested({ each: true })
    extensions: Extension[];
}
