import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(user: IRequestUser) {
    const foundUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        accounts: {
          select: {
            providerId: true,
            password: true,
          },
        },
      },
    });

    if (!foundUser) {
      throw new NotFoundException("User not found");
    }

    const { accounts, ...rest } = foundUser;
    const hasPassword = accounts.some(
      (acc) => acc.password !== null && acc.password !== undefined && acc.password !== ""
    );

    return {
      ...rest,
      hasPassword,
    };
  }

  async updateProfile(user: IRequestUser, payload: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: user.userId },
      data: payload,
    });
  }
}
