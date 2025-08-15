import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/entities/user.schema';
import { UsersService } from 'src/users/users.service';
import { RedisModule } from 'src/redis.module';


@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name,
        schema: UserSchema,
      },
    ]),
  RedisModule
  ],
  providers: [UsersService, AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [UsersService, AuthService, JwtModule, RedisModule],
})
export class AuthModule {}
