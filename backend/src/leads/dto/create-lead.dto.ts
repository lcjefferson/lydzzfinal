import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsNumber,
  IsObject,
  IsEnum,
} from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['hot', 'warm', 'cold'])
  temperature?: string;

  @IsNumber()
  @IsOptional()
  score?: number;

  @IsString()
  @IsOptional()
  @IsEnum([
    'Lead Novo',
    'Em Qualificação',
    'Qualificado (QUENTE)',
    'Reuniões Agendadas',
    'Proposta enviada (Follow-up)',
    'No Show (Não compareceu) (Follow-up)',
    'Contrato fechado',
  ])
  status?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  interest?: string;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}
