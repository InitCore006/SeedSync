import { Course, LearningFilters } from '@/types/learning.types';

// Mock data for courses
const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Modern Irrigation Techniques',
    description: 'Learn about drip irrigation, sprinkler systems, and water conservation methods for efficient farming.',
    category: 'irrigation',
    contentType: 'video',
    thumbnail: 'https://example.com/irrigation.jpg',
    externalUrl: 'https://icar.org.in/courses/irrigation',
    duration: '45 min',
    language: 'Hindi',
    provider: 'ICAR',
    publishedDate: '2024-01-15',
    tags: ['irrigation', 'water-management', 'drip-irrigation'],
  },
  {
    id: '2',
    title: 'Organic Farming Handbook',
    description: 'Complete guide to organic farming practices, certification, and marketing organic produce.',
    category: 'organic-farming',
    contentType: 'pdf',
    thumbnail: 'https://example.com/organic.jpg',
    externalUrl: 'https://nabard.org/organic-farming-guide.pdf',
    duration: '150 pages',
    language: 'English',
    provider: 'NABARD',
    publishedDate: '2024-02-01',
    tags: ['organic', 'certification', 'sustainable'],
  },
  {
    id: '3',
    title: 'Pest Management Audio Course',
    description: 'Identify and control common pests using integrated pest management techniques.',
    category: 'pest-control',
    contentType: 'audio',
    thumbnail: 'https://example.com/pest.jpg',
    externalUrl: 'https://kvk.org/pest-management-audio',
    duration: '30 min',
    language: 'Hindi',
    provider: 'KVK',
    publishedDate: '2024-01-20',
    tags: ['pest-control', 'ipm', 'crop-protection'],
  },
  {
    id: '4',
    title: 'Soil Health Management',
    description: 'Understanding soil testing, nutrients, and improving soil health for better yields.',
    category: 'soil-health',
    contentType: 'video',
    thumbnail: 'https://example.com/soil.jpg',
    externalUrl: 'https://icar.org.in/soil-health',
    duration: '60 min',
    language: 'English',
    provider: 'ICAR',
    publishedDate: '2024-03-01',
    tags: ['soil', 'nutrients', 'testing'],
  },
  {
    id: '5',
    title: 'Marketing Your Produce',
    description: 'Learn effective marketing strategies, pricing, and connecting with buyers.',
    category: 'marketing',
    contentType: 'article',
    thumbnail: 'https://example.com/marketing.jpg',
    externalUrl: 'https://agmarknet.gov.in/marketing-guide',
    duration: '20 min read',
    language: 'Hindi',
    provider: 'AgMarkNet',
    publishedDate: '2024-02-15',
    tags: ['marketing', 'pricing', 'sales'],
  },
  {
    id: '6',
    title: 'Farm Financial Planning',
    description: 'Budget management, loan applications, and financial planning for farmers.',
    category: 'finance',
    contentType: 'pdf',
    thumbnail: 'https://example.com/finance.jpg',
    externalUrl: 'https://nabard.org/financial-planning.pdf',
    duration: '80 pages',
    language: 'English',
    provider: 'NABARD',
    publishedDate: '2024-01-10',
    tags: ['finance', 'loans', 'budget'],
  },
];

class LearningService {
  async getAllCourses(): Promise<Course[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_COURSES;
  }

  async getFilteredCourses(filters: LearningFilters): Promise<Course[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    let filtered = [...MOCK_COURSES];

    if (filters.category) {
      filtered = filtered.filter((course) => course.category === filters.category);
    }

    if (filters.contentType) {
      filtered = filtered.filter((course) => course.contentType === filters.contentType);
    }

    if (filters.language) {
      filtered = filtered.filter((course) => course.language === filters.language);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }

  async getCourseById(id: string): Promise<Course | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_COURSES.find((course) => course.id === id) || null;
  }

  async getBookmarkedCourses(bookmarkedIds: string[]): Promise<Course[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_COURSES.filter((course) => bookmarkedIds.includes(course.id));
  }
}

export const learningService = new LearningService();