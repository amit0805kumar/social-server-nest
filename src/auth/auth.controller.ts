import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createErrorResponse, createResponse } from 'src/common/helpers/response.helpers';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    try {
      const user = await this.authService.validateUser(
        body.username,
        body.password,
      );
      if (!user) throw new UnauthorizedException('Invalid credentials');
      return createResponse(
        await this.authService.login(user),
        'Login successful',
      );

    } catch (error) {
      return createErrorResponse(error.message, 401);
    }
  }
}
