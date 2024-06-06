import { IsInt, Min, Max } from 'class-validator';

export class PlayerSelectionDto {
  @IsInt()
  @Min(2)
  @Max(5)
  numberOfPlayers: number;
}
