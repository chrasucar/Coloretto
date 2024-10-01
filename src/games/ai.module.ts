import { Module } from '@nestjs/common';
import { AiService } from './game.ai';

@Module({
  providers: [AiService],
  exports: [AiService], // Asegúrate de exportar el servicio
})
export class AiModule {}
