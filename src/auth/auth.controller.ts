import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  createErrorResponse,
  createResponse,
} from 'src/common/helpers/response.helpers';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    try {
      const user = await this.authService.validateUser(
        body.username,
        body.password,
      );
      if (!user) throw new UnauthorizedException('Invalid credentials');
      const data = await this.authService.login(user);

      res.cookie('token', data.token, {
        httpOnly: true,
        secure: true, // true for HTTPS
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: '/',
      });

      return createResponse(data, 'Login successful');
    } catch (error) {
      return createErrorResponse(error.message, 401);
    }
  }

  @Get('authCheck')
  @UseGuards(JwtAuthGuard)
  async authCheck(@Req() req: Request, @Res() res: Response) {
    // If JwtAuthGuard passed, user is authenticated
    const userId = (req.user as any).userId;
    const user = await this.usersService.findOne(userId);
    return res.status(HttpStatus.OK).json({
      isAuthenticated: true,
      user: user, // Optional: return user info as well
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    // Clear token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: true, // same as when you set it
      sameSite: 'none',
      path: '/',
    });

    // Optionally remove token from Redis (if using token blacklist)
    // const userId = req.user['id'];
    // await this.authService.invalidateToken(userId);

    return res.json({ success: true, message: 'Logged out successfully' });
  }
}
