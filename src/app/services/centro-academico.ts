import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface representando o modelo do Centro Acadêmico
export interface CentroAcademico {
  id?: number;
  nome: string;
  emailCentral: string;
  telefoneCentral: string;
  coordenador: string;
  iesId: number;            // ID da IES vinculada (Obrigatório)
  iesNome?: string;         // Nome da IES (opcional, para exibir em tabelas)
  dataCadastramento?: string;
  status: boolean;          // true = Ativo, false = Inativo
}

@Injectable({
  providedIn: 'root'
})
export class CentroAcademicoService {
  // Ajuste a URL base conforme a porta e rota configuradas no seu Spring Boot
  private readonly apiUrl = 'http://localhost:8080/api/centros-academicos';

  constructor(private http: HttpClient) {}

  // Listar todos os Centros Acadêmicos
  listarTodos(): Observable<CentroAcademico[]> {
    return this.http.get<CentroAcademico[]>(this.apiUrl);
  }

  // Buscar um CA por ID
  buscarPorId(id: number): Observable<CentroAcademico> {
    return this.http.get<CentroAcademico>(`${this.apiUrl}/${id}`);
  }

  // Cadastrar um novo CA (Requisito 2.2.1)
  criar(centroAcademico: CentroAcademico): Observable<CentroAcademico> {
    return this.http.post<CentroAcademico>(this.apiUrl, centroAcademico);
  }

  // Editar um CA existente (Requisito 2.2.1)
  atualizar(id: number, centroAcademico: CentroAcademico): Observable<CentroAcademico> {
    return this.http.put<CentroAcademico>(`${this.apiUrl}/${id}`, centroAcademico);
  }

  // Inativar ou Ativar o CA (Requisito 2.2.2)
  alterarStatus(id: number, status: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Tentar excluir o CA (O Back-End deve barrar se houver histórico vinculado)
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}