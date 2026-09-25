import { CoreModule } from '@core/core.module';
import { BackgroundModule } from '@modules/background/background.module';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule,
    CoreModule,
     forwardRef(() => BackgroundModule),
  ],
  providers: [
   
    
  ],
  exports: [
   
  ],
})
export class ApiClientModule {}
