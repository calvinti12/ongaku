import {
  Body,
  Controller,
  Post,
  BadRequestException as BadRequest,
  UnauthorizedException as Unauthorized,
  NotFoundException as NotFound,
  UsePipes,
  Res,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Request, Response } from 'express';
import * as dayjs from 'dayjs';

import { JoiValidationPipe } from '@common/pipes/joi.pipe';
import { AuthGuard } from '@common/guards';
import { cookieOptions } from '@utils/cookie';

import { LoginDTO, RegisterDTO } from './auth.dto';
import { loginSchema, registerSchema } from './auth.schemas';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  @UsePipes(new JoiValidationPipe(registerSchema))
  async register(
    @Body() newUserData: RegisterDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const hashedPassword = await hash(newUserData.password, 10);

    const user = await this.authService.register({
      username: newUserData.username,
      fullName: newUserData.fullName,
      password: hashedPassword,
      email: newUserData.email,
      birthdate: dayjs(newUserData.birthdate).toDate(),
    });

    if (!user) {
      throw new BadRequest(
        'Something went wrong while trying to create the user, try again.',
      );
    }

    const token = sign({ user }, this.configService.get('JWT_SECRET'), {
      expiresIn: this.configService.get('JWT_EXPIRY_TIME'),
    });

    response.cookie('token', token, cookieOptions);

    return {
      message: 'Account created successfully.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new JoiValidationPipe(loginSchema))
  async login(
    @Body() userCredentials: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.getUserByEmail(userCredentials.email);

    if (!user) {
      throw new NotFound('The user does not exist.');
    }

    const passwordsMatch = await compare(
      userCredentials.password,
      user.password,
    );

    if (!passwordsMatch) {
      throw new Unauthorized('The password does not match.');
    }

    const token = sign(
      { id: user.id, email: user.email, fullName: user.fullName },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRY_TIME,
      },
    );

    response.cookie('token', token, cookieOptions);

    return {
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  @Get('mail-test')
  async mailTest() {
    const token = Math.floor(1000 + Math.random() * 9000).toString();
    const user = {
      email: '',
      username: '',
    };

    await this.mailService.sendUserConfirmation(user, token);

    return 'ay yo?';
  }

  @Get('csrf')
  getCsrfToken(@Req() request: Request) {
    return { csrf: request.csrfToken() };
  }

  @Get('whoami')
  @UseGuards(AuthGuard)
  whoAmI(@Req() request: Request & { user: Record<string, unknown> }) {
    return { user: request.user };
  }

  @Get('/logout')
  @HttpCode(HttpStatus.RESET_CONTENT)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('token');

    return { message: 'Logged out successfully.' };
  }
}
