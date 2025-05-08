export interface MetaUrl {
  scheme: string;
  netloc: string;
  hostname: string;
  favicon: string;
  path: string;
}

export interface Thumbnail {
  src: string;
  original?: string;
}

export interface NewsResult {
  type: 'news_result';
  title: string;
  url: string;
  description: string;
  age: string;
  page_age: string;
  meta_url: MetaUrl;
  thumbnail: Thumbnail;
}

export interface NewsQuery {
  original: string;
  spellcheck_off: boolean;
  show_strict_warning: boolean;
}

export interface NewsSearchResponse {
  type: 'news';
  query: NewsQuery;
  results: NewsResult[];
}

export interface NewsSearchParams {
  q: string;
  token?: string;
}
