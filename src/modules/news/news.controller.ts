import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiProperty,
  ApiResponse,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { NewsService } from './news.service';
import {
  NewsSearchResponse,
  NewsSearchParams,
} from '@interfaces/news.interface';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search news articles' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({
    name: 'token',
    required: false,
    description: 'API token (optional)',
  })
  searchNews(
    @Query(ValidationPipe) params: NewsSearchParams,
  ): Observable<NewsSearchResponse> {
    return this.newsService.searchNews(params);
  }
}
