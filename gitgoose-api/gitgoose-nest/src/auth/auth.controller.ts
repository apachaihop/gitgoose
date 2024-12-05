import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Req,
  Query,
  Redirect,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { GoogleOAuthGuard } from './google/google-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(GoogleOAuthGuard)
  @Redirect()
  async googleAuthRedirect(@Req() req, @Query('code') code: string) {
    const result = await this.authService.validateOAuthLogin(req.user);
    if (result.user.isActive) {
      return {
        url: `${process.env.FRONTEND_URL}/auth/google/redirect?token=${result.access_token}`,
        statusCode: 302,
      };
    }
    return { error: 'User is not active' };
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
