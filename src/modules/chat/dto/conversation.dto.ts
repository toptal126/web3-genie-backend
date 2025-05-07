import { ApiProperty } from '@nestjs/swagger';

export class ConversationResponseDto {
  @ApiProperty({ description: 'The ID of the conversation' })
  _id: string;

  @ApiProperty({ description: 'The title of the conversation' })
  title: string;

  @ApiProperty({ description: 'The ID of the user who owns the conversation' })
  user_id: string;

  @ApiProperty({ description: 'When the conversation was created' })
  createdAt?: Date;

  @ApiProperty({ description: 'When the conversation was last updated' })
  updatedAt?: Date;
}
