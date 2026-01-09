import { DistrictFilter, NewsArticle } from './types';

export const APP_NAME = "OdishaGPT";

export const DISTRICTS: DistrictFilter[] = [
  'All',
  'Bhubaneswar',
  'Cuttack',
  'Puri',
  'Sambalpur',
  'Rourkela',
  'Jharsuguda',
  'Berhampur'
];

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'New Metro Line Approved for Bhubaneswar-Cuttack Corridor',
    summary: 'The state government has given the green light for the second phase of the metro rail project, connecting key IT hubs.',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    district: 'Bhubaneswar',
    category: 'Infrastructure',
    tags: ['Metro', 'Development', 'Transport'],
    timestamp: '2 hours ago',
    author: 'Odisha Daily'
  },
  {
    id: '2',
    title: 'Puri Heritage Corridor Attracts Record Tourists',
    summary: 'Following the inauguration of the Parikrama Prakalpa, footfall in the pilgrim city has doubled this weekend.',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    district: 'Puri',
    category: 'Tourism',
    tags: ['Jagannath Temple', 'Culture', 'Heritage'],
    timestamp: '4 hours ago',
    author: 'Puri Samachar'
  },
  {
    id: '3',
    title: 'Sambalpur Handloom Expo Kicks Off',
    summary: 'Over 500 weavers from across Western Odisha are showcasing their Sambalpuri sarees and textiles.',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    district: 'Sambalpur',
    category: 'Culture',
    tags: ['Handloom', 'Art', 'Economy'],
    timestamp: '6 hours ago',
    author: 'Western Times'
  },
  {
    id: '4',
    title: 'New Flight Route Announced from Jharsuguda Airport',
    summary: 'Veer Surendra Sai Airport expands connectivity with direct flights to Bangalore starting next month.',
    imageUrl: 'https://picsum.photos/800/600?random=4',
    district: 'Jharsuguda',
    category: 'Transport',
    tags: ['Aviation', 'Travel', 'Business'],
    timestamp: '1 day ago',
    author: 'Industrial Post'
  },
  {
    id: '5',
    title: 'Smart City Smart Parking App Update Released',
    summary: 'Bhubaneswar Smart City Ltd releases updated parking app with real-time slot availability features.',
    imageUrl: 'https://picsum.photos/800/600?random=5',
    district: 'Bhubaneswar',
    category: 'Technology',
    tags: ['Smart City', 'App', 'Utility'],
    timestamp: '1 day ago',
    author: 'Tech Odisha'
  },
  {
    id: '6',
    title: 'Rourkela Steel Plant Achieves Record Production',
    summary: 'RSP sets a new benchmark in hot metal production for the fiscal year Q3.',
    imageUrl: 'https://picsum.photos/800/600?random=6',
    district: 'Rourkela',
    category: 'Industry',
    tags: ['Steel', 'Economy', 'Growth'],
    timestamp: '2 days ago',
    author: 'Steel City News'
  },
   {
    id: '7',
    title: 'Bali Yatra Preparations Begin in Cuttack',
    summary: 'The historic maritime trade festival setup has begun on the banks of Mahanadi.',
    imageUrl: 'https://picsum.photos/800/600?random=7',
    district: 'Cuttack',
    category: 'Events',
    tags: ['Festival', 'History', 'Mahanadi'],
    timestamp: '5 hours ago',
    author: 'Cuttack Chronicle'
  }
];

export const CATEGORIES = ['All', 'Infrastructure', 'Tourism', 'Culture', 'Industry', 'Technology', 'Events'];

export const CHAT_HINTS = [
  "What's the latest news in Bhubaneswar?",
  "Tell me about upcoming festivals in Puri.",
  "Any new industrial projects in Jharsuguda?",
  "Summarize today's headlines.",
  "Status of flights from Rourkela?"
];
