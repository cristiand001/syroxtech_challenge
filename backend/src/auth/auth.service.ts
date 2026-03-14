import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";

const HARDCODED_USER = {
  email: "admin@test.com",
  password: "1234",
  id: 1,
  role: "admin",
};

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    if (
      dto.email !== HARDCODED_USER.email ||
      dto.password !== HARDCODED_USER.password
    ) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = {
      sub: HARDCODED_USER.id,
      email: HARDCODED_USER.email,
      role: HARDCODED_USER.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
