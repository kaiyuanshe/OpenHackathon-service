import { Type } from 'class-transformer';
import {
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    Min
} from 'class-validator';
import { NewData } from 'mobx-restful';
import {
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

export type InputData<T> = NewData<Omit<T, keyof Base>, Base>;

export class BaseFilter {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    pageSize?: number = 10;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    pageIndex?: number = 1;

    @IsString()
    @IsOptional()
    keywords?: string;
}

export interface ListChunk<T> {
    count: number;
    list: T[];
}

export abstract class Base {
    @IsInt()
    @IsOptional()
    @PrimaryGeneratedColumn()
    id: number;

    @IsDateString()
    @IsOptional()
    @CreateDateColumn()
    createdAt: string;

    @IsDateString()
    @IsOptional()
    @UpdateDateColumn()
    updatedAt: string;

    @IsDateString()
    @IsOptional()
    @DeleteDateColumn({ select: false })
    deletedAt?: string;
}

export class Media {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsUrl()
    uri: string;
}
