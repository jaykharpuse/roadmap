

export interface Review {
  _id: string;
  roadmap: string;
  user: string;
  rating: number;
  title?: string;
  review: string;
  pros?: string[];
  cons?: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
