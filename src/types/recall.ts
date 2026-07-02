export interface CreateBotResponse {
  id: string;
  status_changes?: {
    code: string;
    sub_code?: string | null;
  }[];
}