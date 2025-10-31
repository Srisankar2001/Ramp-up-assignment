import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseDTO } from './model/responseDTO.model';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Context } from './context';
import { vechileInput } from './model/vechileInput.model';
import { RecordInput } from './model/recordInput.model';

const GET_ALL_VECHILE = gql`
  query GetAllVechile($page: Int!, $limit: Int!) {
    getAllVechile(page: $page, limit: $limit) {
      totalPage
      currentPage
      limit
      vechileList {
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
  }
`;

const GET_ALL_VECHILE_BY_MODEL = gql`
  query GetAllVechileByModel($model: String!, $page: Int!, $limit: Int!) {
    getAllVechileByModel(model: $model, page: $page, limit: $limit) {
      totalPage
      currentPage
      limit
      vechileList {
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
  }
`;

const GET_VECHILE_BY_ID = gql`
  query GetVechile($id: Int!) {
    getVechile(id: $id) {
      vin
      id
      first_name
      last_name
      email
      car_make
      car_model
      manufactured_date
      age_of_vechile
    }
  }
`;

const CREATE_VECHILE = gql`
  mutation CreateVechile($input: CreateVechileInput!) {
    createVechile(createVechileInput: $input) {
      success
      message
    }
  }
`;

const UPDATE_VECHILE = gql`
  mutation UpdateVechile($id: Int!, $input: UpdateVechileInput!) {
    updateVechile(id: $id, updateVechileInput: $input) {
      success
      message
    }
  }
`;

const DELETE_VECHILE = gql`
  mutation DeleteVechile($id: Int!) {
    deleteVechile(id: $id) {
      success
      message
    }
  }
`;

const GET_RECORDS = gql`
  query GetVechileByVIN($vin: String!) {
    getVechileByVIN(vin: $vin) {
      vin
      id
      first_name
      last_name
      email
      car_make
      car_model
      manufactured_date
      age_of_vechile
      records {
        id
        vin
        date
        maintenance
      }
    }
  }
`;

const CREATE_RECORD = gql`
  mutation CreateRecord($input: CreateRecordInput!) {
    createRecord(createRecordInput: $input) {
      success
      message
    }
  }
`;

const UPDATE_RECORD = gql`
  mutation UpdateRecord($id: Int!, $input: UpdateRecordInput!) {
    updateRecord(id: $id, updateRecordInput: $input) {
      success
      message
    }
  }
`;

const DELETE_RECORD = gql`
  mutation RemoveRecord($id: Int!) {
    removeRecord(id: $id) {
      success
      message
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private restUrl = 'http://localhost:4001/vechile';

  constructor(
    private readonly http: HttpClient,
    private readonly apollo: Apollo,
    private readonly context: Context
  ) {}

  uploadVechile(file: File): Observable<ResponseDTO> {
    const formData = new FormData();
    formData.append('userId', this.context.getUserId());
    formData.append('file', file);
    return this.http.post<ResponseDTO>(`${this.restUrl}/upload`, formData);
  }

  downloadVechile(age: number): Observable<ResponseDTO> {
    const userId = this.context.getUserId();
    return this.http.post<ResponseDTO>(`${this.restUrl}/export`, { age, userId });
  }

  downloadFile(fileName: string): Observable<Blob> {
    return this.http.post(`${this.restUrl}/download`, { fileName }, { responseType: 'blob' });
  }

  getVechiles(page: number, limit: number): Observable<any> {
    return this.apollo
      .query<any>({
        query: GET_ALL_VECHILE,
        variables: { page, limit },
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data.getAllVechile));
  }

  getVechilesByModel(model: String, page: number, limit: number): Observable<any> {
    return this.apollo
      .query<any>({
        query: GET_ALL_VECHILE_BY_MODEL,
        variables: { model, page, limit },
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data.getAllVechileByModel));
  }

  getVechileById(id: number): Observable<any> {
    return this.apollo
      .query<any>({
        query: GET_VECHILE_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data.getVechile));
  }

  createVechile(vechile: vechileInput): Observable<any> {
    return this.apollo
      .mutate<any>({
        mutation: CREATE_VECHILE,
        variables: {
          input: vechile,
        },
      })
      .pipe(
        map((result) => {
          return result.data?.createVechile;
        })
      );
  }

  updateVechile(id: number, vechile: vechileInput): Observable<any> {
    return this.apollo
      .mutate<any>({
        mutation: UPDATE_VECHILE,
        variables: {
          id: id,
          input: vechile,
        },
      })
      .pipe(
        map((result) => {
          return result.data?.updateVechile;
        })
      );
  }

  deleteVechile(id: number): Observable<any> {
    return this.apollo
      .mutate<any>({
        mutation: DELETE_VECHILE,
        variables: {
          id: id,
        },
      })
      .pipe(
        map((result) => {
          return result.data?.deleteVechile;
        })
      );
  }

  getRecordByVIN(vin: string): Observable<any> {
    return this.apollo
      .query<any>({
        query: GET_RECORDS,
        variables: { vin },
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data.getVechileByVIN));
  }

  createRecord(record: RecordInput): Observable<any> {
    return this.apollo
      .mutate<any>({
        mutation: CREATE_RECORD,
        variables: {
          input: record,
        },
      })
      .pipe(
        map((result) => {
          return result.data?.createRecord;
        })
      );
  }

  updateRecord(id: number, record: RecordInput): Observable<any> {
    return this.apollo
      .mutate<any>({
        mutation: UPDATE_RECORD,
        variables: {
          id: id,
          input: record,
        },
      })
      .pipe(
        map((result) => {
          return result.data?.updateRecord;
        })
      );
  }

  deleteRecord(id: number): Observable<any> {
    return this.apollo
      .mutate<any>({
        mutation: DELETE_RECORD,
        variables: {
          id: id,
        },
      })
      .pipe(
        map((result) => {
          return result.data?.removeRecord;
        })
      );
  }
}
