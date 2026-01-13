import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository, IsNull } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * Refresh Token을 DB에 저장합니다.
   * @param userId - 사용자 ID
   * @param token - Refresh Token
   * @param expiresAt - 만료 시각
   * @param deviceInfo - 기기 정보 (선택)
   * @param ipAddress - IP 주소 (선택)
   * @returns 생성된 RefreshToken 엔티티
   */
  async create(
    userId: string,
    token: string,
    expiresAt: Date,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<RefreshToken> {
    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token,
      expiresAt,
      deviceInfo: deviceInfo || null,
      ipAddress: ipAddress || null,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  /**
   * 토큰으로 RefreshToken을 조회합니다.
   * @param token - Refresh Token
   * @returns RefreshToken 엔티티 또는 null
   */
  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { token, revokedAt: IsNull() },
    });
  }

  /**
   * 특정 토큰을 무효화합니다.
   * @param token - Refresh Token
   */
  async revoke(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { revokedAt: new Date() },
    );
  }

  /**
   * 특정 사용자의 모든 토큰을 무효화합니다.
   * @param userId - 사용자 ID
   */
  async revokeAllByUserId(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  /**
   * 특정 토큰을 삭제합니다.
   * @param token - Refresh Token
   */
  async deleteByToken(token: string): Promise<void> {
    await this.refreshTokenRepository.delete({ token });
  }

  /**
   * 만료된 토큰을 삭제합니다.
   */
  async deleteExpired(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  /**
   * 특정 사용자의 모든 토큰을 삭제합니다.
   * @param userId - 사용자 ID
   */
  async deleteAllByUserId(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
  }
}
