export type RecordStatus = 'active' | 'archived';

export type RecordItem = {
  id: number;
  title: string;
  owner: string;
  status: RecordStatus;
  createdAt: string;
};
