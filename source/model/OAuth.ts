import { IsString } from 'class-validator';

export class OAuthSignInData {
    @IsString()
    accessToken: string;
}
