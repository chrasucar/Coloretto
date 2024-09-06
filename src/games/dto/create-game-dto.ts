import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateGameDto {
  @IsString()
  gameName: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  maxPlayers: number;

  @IsBoolean()
  isAiControlled: boolean;

  @IsString()
  owner: string;

  @IsOptional()
  players?: string[];

  @IsOptional()
  @IsNumber()
  aiPlayersCount?: number;
}
