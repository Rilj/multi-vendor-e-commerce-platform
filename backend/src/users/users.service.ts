import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { Address, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { ChangePasswordDto } from "./dtos/change-password.dto";
import { CreateAddressDto } from "./dtos/create-address.dto";
import { UpdateAddressDto } from "./dtos/update-address.dto";

type SafeUser = Omit<User, "passwordHash">;

interface GeocodeInput {
  address: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface GeocodeResult {
  latitude: number | null;
  longitude: number | null;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private toSafeUser(user: User): SafeUser {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.toSafeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<SafeUser> {
    if (dto.email) {
      const conflict = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
        select: { id: true },
      });
      if (conflict) {
        throw new BadRequestException("Email already in use");
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return this.toSafeUser(user);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const passwordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const rounds = this.configService.get<number>("bcrypt.rounds", 12);
    const passwordHash = await bcrypt.hash(dto.newPassword, rounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true };
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAddress(userId: string, addressId: string): Promise<Address> {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) {
      throw new NotFoundException("Address not found");
    }
    return address;
  }

  async createAddress(userId: string, dto: CreateAddressDto): Promise<Address> {
    const { latitude, longitude } = await this.geocodeIfNeeded(dto);

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId,
        label: dto.label ?? null,
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
        province: dto.province ?? null,
        city: dto.city ?? null,
        district: dto.district ?? null,
        postalCode: dto.postalCode ?? null,
        latitude,
        longitude,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    const existing = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!existing) {
      throw new NotFoundException("Address not found");
    }

    const data: Record<string, unknown> = { ...dto };

    const addressChanged =
      dto.address !== undefined && dto.address !== existing.address;
    const coordsProvided =
      dto.latitude !== undefined || dto.longitude !== undefined;

    if (addressChanged && !coordsProvided) {
      const geo = await this.geocodeIfNeeded({
        address: dto.address!,
        city: dto.city,
        district: dto.district,
        province: dto.province,
        postalCode: dto.postalCode,
      });
      if (geo.latitude !== null) {
        data.latitude = geo.latitude;
      }
      if (geo.longitude !== null) {
        data.longitude = geo.longitude;
      }
    } else if (coordsProvided) {
      data.latitude = dto.latitude ?? null;
      data.longitude = dto.longitude ?? null;
    }

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true, NOT: { id: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId, userId },
      data: data as any,
    });
  }

  async deleteAddress(
    userId: string,
    addressId: string,
  ): Promise<{ success: boolean }> {
    const result = await this.prisma.address.deleteMany({
      where: { id: addressId, userId },
    });
    if (result.count === 0) {
      throw new NotFoundException("Address not found");
    }
    return { success: true };
  }

  async setDefaultAddress(
    userId: string,
    addressId: string,
  ): Promise<Address> {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
      select: { id: true },
    });
    if (!address) {
      throw new NotFoundException("Address not found");
    }

    await this.prisma.address.updateMany({
      where: { userId, isDefault: true, NOT: { id: addressId } },
      data: { isDefault: false },
    });

    return this.prisma.address.update({
      where: { id: addressId, userId },
      data: { isDefault: true },
    });
  }

  private async geocodeIfNeeded(
    input: GeocodeInput,
  ): Promise<GeocodeResult> {
    if (input.latitude != null && input.longitude != null) {
      return { latitude: input.latitude, longitude: input.longitude };
    }

    const endpoint = this.configService.get<string>("geocoding.url");
    if (!endpoint) {
      return { latitude: null, longitude: null };
    }

    try {
      const parts = [
        input.address,
        input.city,
        input.district,
        input.province,
        input.postalCode,
      ].filter((part): part is string => Boolean(part));
      const query = encodeURIComponent(parts.join(", "));
      const res = await fetch(`${endpoint}?q=${query}&format=json&limit=1`);

      if (!res.ok) {
        return { latitude: null, longitude: null };
      }

      const json: unknown = await res.json();
      if (!Array.isArray(json) || json.length === 0) {
        return { latitude: null, longitude: null };
      }

      const first = json[0] as { lat?: string; lon?: string };
      const latitude = first.lat ? Number(first.lat) : null;
      const longitude = first.lon ? Number(first.lon) : null;

      return {
        latitude:
          latitude !== null && !Number.isNaN(latitude) ? latitude : null,
        longitude:
          longitude !== null && !Number.isNaN(longitude) ? longitude : null,
      };
    } catch (error) {
      this.logger.warn(
        `Geocoding failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
      return { latitude: null, longitude: null };
    }
  }
}
