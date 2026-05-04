export type Repo = {
  id?: string;

  userId?: string;

  name: string;
  url: string;

  stars: number;
  language: string | null;

  updatedAt: string;

  description?: string | null;

  score?: number;

  selected?: boolean;
};
