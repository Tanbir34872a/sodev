import { Test, TestingModule } from '@nestjs/testing';
import { UserSkillService } from './user_skill.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserSkill } from './entities/user_skill.entity';
import { Skill } from './entities/skill.entity';
import { ExperienceService } from '@/modules/experience/experience.service';
import {
  CreateNewUserSkillDto,
  CreateUserSkillDto,
} from './dto/create-user_skill.dto';
import { isErrorResponse } from '@/utils/type-guards';

const mockSkill = {
  _id: 'skillId123',
  name: 'JavaScript',
};

const mockUserSkill = {
  _id: 'userSkillId123',
  user: 'userId123',
  skill: 'skillId123',
  experience: 'experienceId123',
};

const mockExperience = {
  _id: 'experienceId123',
  title: 'Software Engineer',
};

const mockSkillModel = {
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockUserSkillModel = {
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockExperienceService = {
  findOne: jest.fn(),
};

describe('UserSkillService', () => {
  let service: UserSkillService;
  let skillModel: typeof mockSkillModel;
  let userSkillModel: typeof mockUserSkillModel;
  let experienceService: typeof mockExperienceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSkillService,
        {
          provide: getModelToken(Skill.name),
          useValue: mockSkillModel,
        },
        {
          provide: getModelToken(UserSkill.name),
          useValue: mockUserSkillModel,
        },
        {
          provide: ExperienceService,
          useValue: mockExperienceService,
        },
      ],
    }).compile();

    service = module.get<UserSkillService>(UserSkillService);
    skillModel = module.get(getModelToken(Skill.name));
    userSkillModel = module.get(getModelToken(UserSkill.name));
    experienceService = module.get(ExperienceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNewUserSkill', () => {
    it('should create a new user skill', async () => {
      const createNewUserSkillDto: CreateNewUserSkillDto = {
        skillname: 'JavaScript',
        experience: 'experienceId123',
      };

      skillModel.create.mockResolvedValueOnce(mockSkill);
      userSkillModel.create.mockResolvedValueOnce(mockUserSkill);

      const result = await service.createNewUserSkill(
        createNewUserSkillDto,
        'userId123',
      );

      expect(skillModel.create).toHaveBeenCalledWith({ name: 'JavaScript' });
      expect(userSkillModel.create).toHaveBeenCalledWith({
        user: 'userId123',
        skill: mockSkill._id,
      });
      expect(result.status).toBe(201);
      expect(result.userSkill).toEqual(mockUserSkill);
    });
  });

  describe('addSkillToUser', () => {
    it('should return 404 if skill is not found', async () => {
      const createUserSkillDto: CreateUserSkillDto = {
        skill: 'nonexistentSkillId',
        experience: 'experienceId123',
      };

      // Mock skillModel.findOne to return null
      skillModel.findOne.mockResolvedValueOnce(null);

      const result = await service.addSkillToUser(
        createUserSkillDto,
        'userId123',
      );

      // console.log('Result:', result);
      // Check if the result is an error response
      if (isErrorResponse(result)) {
        expect(result.statusCode).toBe(404);
        expect(result.message).toBe('Skill not found');
      } else {
        throw new Error('Expected an error response, but got success');
      }
    });
  });

  describe('findSkilledUsers', () => {
    it('should return all users with a specific skill', async () => {
      userSkillModel.find.mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          populate: jest.fn().mockResolvedValueOnce([mockUserSkill]),
        }),
      });

      const result = await service.findSkilledUsers('skillId123');

      expect(userSkillModel.find).toHaveBeenCalledWith({ skill: 'skillId123' });
      expect(result.status).toBe(200);
      expect(result.skilledUsers).toEqual([mockUserSkill]);
    });
  });

  describe('findAll', () => {
    it('should return all user skills for a user', async () => {
      userSkillModel.find.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue([mockUserSkill]),
      });

      const result = await service.findAll('userId123');

      expect(userSkillModel.find).toHaveBeenCalledWith({ user: 'userId123' });
      expect(result.status).toBe(200);
      expect(result.userSkills).toEqual([mockUserSkill]);
    });
  });

  describe('findSkillList', () => {
    it('should return all skills', async () => {
      skillModel.find.mockResolvedValueOnce([mockSkill]);

      const result = await service.findSkillList();

      expect(skillModel.find).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.skills).toEqual([mockSkill]);
    });
  });
});
