import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * kakaoId로 사용자를 조회합니다.
   * @param kakaoId - 카카오 사용자 ID
   * @returns 사용자 정보 또는 null
   */
  async findByKakaoId(kakaoId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { kakaoId } });
  }

  /**
   * 새로운 사용자를 생성합니다.
   * @param kakaoId - 카카오 사용자 ID
   * @param nickname - 닉네임
   * @param profileImageUrl - 프로필 이미지 URL (선택)
   * @returns 생성된 사용자 정보
   */
  async create(
    kakaoId: string,
    nickname: string,
    profileImageUrl: string | null = null,
  ): Promise<User> {
    const user = this.userRepository.create({
      kakaoId,
      nickname,
      profileImageUrl,
    });
    return this.userRepository.save(user);
  }

  /**
   * ID로 사용자를 조회합니다.
   * @param id - 사용자 ID (UUID)
   * @returns 사용자 정보 또는 null
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * 닉네임으로 사용자를 조회합니다.
   * @param nickname - 닉네임
   * @returns 사용자 정보 또는 null
   */
  async findByNickname(nickname: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { nickname } });
  }
}
