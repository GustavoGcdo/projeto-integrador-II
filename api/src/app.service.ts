import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      name: 'EcoDescarte API',
      status: 'ok',
    };
  }
}
