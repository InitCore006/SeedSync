export type ContentType = 'video' | 'pdf' | 'audio' | 'article' | 'book';

export type CourseCategory = 
  | 'crop-management'
  | 'pest-control'
  | 'irrigation'
  | 'soil-health'
  | 'organic-farming'
  | 'modern-techniques'
  | 'marketing'
  | 'finance';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  contentType: ContentType;
  thumbnail: string;
  externalUrl: string;
  duration?: string; // e.g., "45 min" or "120 pages"
  language: string;
  provider: string; // e.g., "ICAR", "NABARD", "KVK"
  publishedDate: string;
  tags: string[];
  isBookmarked?: boolean;
}

export interface LearningFilters {
  category?: CourseCategory;
  contentType?: ContentType;
  language?: string;
  searchQuery?: string;
}