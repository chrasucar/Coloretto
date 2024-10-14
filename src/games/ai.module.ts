import { Module } from '@nestjs/common';
import { AiService } from './game.ai';

@Module({
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
