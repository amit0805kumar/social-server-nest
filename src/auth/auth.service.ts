import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UserDto } from 'src/users/dto/user.dto';
import { User, UserDocument } from 'src/users/entities/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    // Fetch user from DB and validate password
    const user = await this.userModel.findOne({
      username: username,
    });
    if (user !== null) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const userObj = user.toObject?.() || user;
        const { password, ...result } = userObj;
        return result;
      }
    }
    return null;
  }

  async login(user: any): Promise<{ token: string; user: UserDto }> {
    const payload = { username: user.username, sub: user.id };
    return {
      token: await this.jwtService.sign(payload),
      user: user,
    };
  }
}
