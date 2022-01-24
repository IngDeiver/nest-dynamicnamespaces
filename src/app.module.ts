import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MainGateway } from './main.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, MainGateway],
})
export class AppModule {}
