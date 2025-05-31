/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginInput } from './dto/login.dto';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async login(loginInput: LoginInput, res: Response) {
    const user = await this.verifyUser(loginInput.email, loginInput.password);
    const expires = new Date();
    expires.setMinutes(
      expires.getMinutes() +
        parseInt(this.configService.getOrThrow('JWT_EXPIRATION_MS'))
    );
    const tokenPayload: TokenPayload = { userId: user.id };
    const token = this.jwtService.sign(tokenPayload);
    res.cookie('Authentication', token, {
      httpOnly: true,
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
      expires,
    });
    return user;
  }

  private async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUserByEmail(email);
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
