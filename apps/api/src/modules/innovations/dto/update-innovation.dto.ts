import { PartialType } from '@nestjs/mapped-types';
import { CreateInnovationDto } from './create-innovation.dto';

export class UpdateInnovationDto extends PartialType(CreateInnovationDto) {}
