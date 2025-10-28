import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseDTO } from './model/responseDTO.model';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { map } from 'rxjs/operators';

const GET_VEHICLES = gql`
  query GetAllVehicle($page: Int!, $limit: Int!) {
    getAllVehicle(page: $page, limit: $limit) {
      id
      first_name
      last_name
      email
      car_make
      car_model
      vin
      manufactured_date
      age_of_vechile
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private apiUrl = 'http://localhost:4001/vechile';

  constructor(private http: HttpClient, private apollo: Apollo) {}

  importVechile(file: File): Observable<ResponseDTO> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ResponseDTO>(`${this.apiUrl}/import`, formData);
  }

  downloadVechile(fileName: string): Observable<ResponseDTO> {
    return this.http.post<ResponseDTO>(`${this.apiUrl}/download`, fileName);
  }

  getVehicles(page: number, limit: number): Observable<any[]> {
    return this.apollo
      .watchQuery<any>({ query: GET_VEHICLES, variables: { page, limit } })
      .valueChanges.pipe(map((result) => result.data?.getAllVechile ?? []));
  }
}
