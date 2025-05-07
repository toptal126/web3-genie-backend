import { ApiProperty } from '@nestjs/swagger';

export class ConversationResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}
