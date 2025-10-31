import { Vechile } from './vechile.model';

export interface PaginationResponse {
  totalPage: number;
  currentPage: number;
  limit: number;
  vechileList: Vechile[];
}
