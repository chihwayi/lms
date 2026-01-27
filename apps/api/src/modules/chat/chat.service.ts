import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, ConversationType } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Participant } from './entities/participant.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
  ) {}

  async createDirectConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    // Check if conversation already exists
    const existing = await this.conversationRepository.createQueryBuilder('c')
      .innerJoin('c.participants', 'p1', 'p1.userId = :user1Id', { user1Id })
      .innerJoin('c.participants', 'p2', 'p2.userId = :user2Id', { user2Id })
      .where('c.type = :type', { type: ConversationType.DIRECT })
      .getOne();

    if (existing) return existing;

    // Create new conversation
    const conversation = await this.conversationRepository.save({
      type: ConversationType.DIRECT,
    });

    await this.participantRepository.save([
      { conversationId: conversation.id, userId: user1Id },
      { conversationId: conversation.id, userId: user2Id },
    ]);

    return conversation;
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    const message = await this.messageRepository.save({
      conversationId,
      senderId,
      content,
    });

    return this.messageRepository.findOne({
      where: { id: message.id },
      relations: ['sender'],
    });
  }

  async getMessages(conversationId: string, limit = 50): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      take: limit,
      relations: ['sender'],
    });
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.createQueryBuilder('c')
      .innerJoin('c.participants', 'p', 'p.userId = :userId', { userId })
      .leftJoinAndSelect('c.participants', 'all_p')
      .leftJoinAndSelect('all_p.user', 'u')
      .leftJoinAndSelect('c.messages', 'm') // This might be heavy, optimize later
      .orderBy('m.createdAt', 'DESC')
      .getMany();
  }
}
