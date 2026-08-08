import { Controller, Get, Head } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Head()
  getHealthCheck() {
    return {
      status: 'online',
      message: 'CryptoMine USDT TRC20 Cloud Mining Platform API Server is Live & Healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
