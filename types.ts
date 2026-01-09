export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  district: string;
  category: string;
  tags: string[];
  timestamp: string;
  author: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title: string }[];
}

export interface ChatProject {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

export type DistrictFilter = 'All' | 'Bhubaneswar' | 'Cuttack' | 'Puri' | 'Sambalpur' | 'Rourkela' | 'Jharsuguda' | 'Berhampur';
