import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { FilesService } from '../files/files.service';

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userRepository: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filesService: any;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockFilesService = {
      uploadAvatar: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    filesService = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = { id: '1', firstName: 'John' };
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.getProfile('1');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.getProfile('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar and update user', async () => {
      const file = { buffer: Buffer.from('test') } as unknown as Express.Multer.File;
      const fileName = 'avatar.jpg';
      filesService.uploadAvatar.mockResolvedValue(fileName);
      userRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.uploadAvatar('1', file);
      expect(filesService.uploadAvatar).toHaveBeenCalledWith(file);
      expect(userRepository.update).toHaveBeenCalledWith('1', { avatar: fileName });
      expect(result).toEqual({ avatar: fileName });
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      userRepository.delete.mockResolvedValue({ affected: 1 });
      const result = await service.deleteAccount('1');
      expect(userRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual({ success: true, message: 'Account deleted successfully' });
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.deleteAccount('1')).rejects.toThrow(NotFoundException);
    });
  });
});
