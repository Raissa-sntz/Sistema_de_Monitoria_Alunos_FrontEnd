import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Ies {
  id?: number;
  sigla: string;
  nome: string;
  emailCentral: string;
  telefoneCentral: string;
  reitor: string;
  proReitorias?: string;
  status?: string;
}

export interface CentroAcademico {
  id?: number;
  sigla: string;
  nome: string;
  emailCentral: string;
  telefoneCentral: string;
  coordenador: string;
  iesId: number;
  iesNome?: string;
  iesSigla?: string;
  dataCadastramento?: string;
  status: string;
}

interface RespostaLogin {
  token: string;
  tipo: string;
  expiraEm: string;
  usuario: {
    id: number;
    login: string;
    nome: string;
    perfis: string[];
    docenteId: number | null;
    discenteId: number | null;
  };
}

interface Monitoria {
  id: number;
  docenteId: number;
  docenteNome: string;
  discenteId: number;
  discenteNome: string;
  discenteMatricula: string;
  disciplinaId: number;
  disciplinaSigla: string;
  disciplinaDescricao: string;
  semestre: string;
  diasSemana: string[];
  horaInicio: string;
  horaFim: string;
  dataInicio: string;
  dataFim: string;
  dataCadastro: string;
  status: string;
  situacao: string;
}

interface Curso {
  id: number;
  sigla: string;
  descricao: string;
  centroAcademicoId?: number;
  centroAcademicoSigla?: string;
  iesSigla?: string;
  turnos?: string[];
  coordenador?: string;
  dataCadastro?: string;
  status?: string;
}

interface CentroAcademicoCurso {
  id: number;
  sigla: string;
  descricao?: string;
}

interface Disciplina {
  id: number;
  sigla: string;
  descricao: string;
  cursoId: number;
  cursoSigla: string;
  cargaHoraria: number;
  docenteId: number;
  docenteNome: string;
  dataCadastro: string;
  status: string;
}

interface Docente {
  id: number;
  matricula: string;
  nome: string;
  email: string;
  telefone: string;
  centroAcademicoId: number;
  centroAcademicoSigla: string;
  login: string;
  dataCadastro: string;
  status: string;
}

interface LogAuditoria {
  id: number;
  usuarioLogin: string;
  metodo: string;
  uri: string;
  acao: string;
  statusHttp: number | null;
  ip: string;
  dataHora: string;
}

interface PaginaLogs {
  content: LogAuditoria[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  mostrarLogin = false;
mensagemRelatorio = '';

tipoRelatorio: 'completo' | 'docentes' | '' = '';
carregandoRelatorio = false;

centrosRelatorio: CentroAcademico[] = [];
cursosRelatorio: Curso[] = [];
docentesRelatorio: Docente[] = [];

filtroStatusRelatorio: 'TODOS' | 'ATIVO' | 'INATIVO' = 'TODOS';

nomeAdministradorRelatorio = '';
hojeRelatorio = new Date();

usuarioLogado: RespostaLogin['usuario'] | null = null;

  login = '';
  senha = '';
  mensagemLogin = '';
  carregando = false;

  // Monitorias
  monitorias: Monitoria[] = [];
  carregandoMonitorias = false;
  mensagemMonitorias = '';

  // Disciplinas
  mostrarCadastroDisciplina = false;
  cursos: Curso[] = [];
  disciplinas: Disciplina[] = [];
  carregandoCursos = false;
  carregandoDisciplinas = false;
  salvandoDisciplina = false;
  mensagemDisciplina = '';
  tipoMensagemDisciplina: 'sucesso' | 'erro' | '' = '';

  novaDisciplina = {
    sigla: '',
    descricao: '',
    cursoId: null as number | null,
    cargaHoraria: null as number | null
  };

  // Administrador
  abaAdmin:
    | 'ies'
    | 'ca'
    | 'cursos'
    | 'docentes'
    | 'logs'
    | 'relatorios' = 'ies';

  // Logs de auditoria
  logsAuditoria: LogAuditoria[] = [];
  carregandoLogs = false;
  mensagemLogs = '';
  filtroUsuarioLogs = '';
  paginaLogs = 0;
  totalPaginasLogs = 0;
  totalRegistrosLogs = 0;
  tamanhoPaginaLogs = 50;

  // Centros Acadêmicos
  listaCentrosAcademicos: CentroAcademico[] = [];
  carregandoCA = false;
  salvandoCA = false;
  mensagemCA = '';
  tipoMensagemCA: 'sucesso' | 'erro' | '' = '';

  editandoCAId: number | null = null;
  filtroIesCA: number | null = null;

  novoCA = {
    sigla: '',
    nome: '',
    emailCentral: '',
    telefoneCentral: '',
    coordenador: '',
    iesId: null as number | null
  };

  caSelecionadoStatus: CentroAcademico | null = null;
  motivoStatusCA = '';
  mensagemStatusCA = '';
  salvandoStatusCA = false;

  // Cursos administrativos
  cursosAdmin: Curso[] = [];
  centrosAcademicosCurso: CentroAcademicoCurso[] = [];

  carregandoCursosAdmin = false;
  salvandoCursoAdmin = false;

  mensagemCursoAdmin = '';
  tipoMensagemCursoAdmin: 'sucesso' | 'erro' | '' = '';

  editandoCursoAdminId: number | null = null;

  novoCursoAdmin = {
    sigla: '',
    descricao: '',
    centroAcademicoId: 0,
    turnos: [] as string[],
    coordenador: ''
  };

  turnosDisponiveis = [
    'MATUTINO',
    'VESPERTINO',
    'NOTURNO',
    'INTEGRAL'
  ];

  // Docentes administrativos
  docentesAdmin: Docente[] = [];
  centrosAcademicosDocente: CentroAcademicoCurso[] = [];

  carregandoDocentes = false;
  salvandoDocente = false;
  mensagemDocente = '';
  tipoMensagemDocente: 'sucesso' | 'erro' | '' = '';

  editandoDocenteId: number | null = null;

  novoDocente = {
    matricula: '',
    nome: '',
    email: '',
    telefone: '',
    centroAcademicoId: 0,
    senhaInicial: ''
  };

  docenteSelecionadoStatus: Docente | null = null;
  motivoStatusDocente = '';
  mensagemStatusDocente = '';
  salvandoStatusDocente = false;

  // Instituições de Ensino Superior
  listaIes: Ies[] = [
    {
      id: 1,
      sigla: 'UCSAL',
      nome: 'Universidade Católica do Salvador',
      emailCentral: 'central@ucsal.br',
      telefoneCentral: '(71) 3203-2500',
      reitor: 'Prof. Reitor UCSAL',
      status: 'ATIVO'
    },
    {
      id: 2,
      sigla: 'UCB',
      nome: 'Universidade Católica de Brasília',
      emailCentral: 'central@ucb.br',
      telefoneCentral: '(61) 3356-9000',
      reitor: 'Prof. Reitor UCB',
      status: 'ATIVO'
    },
    {
      id: 3,
      sigla: 'PUC-Rio',
      nome: 'Pontifícia Universidade Católica do Rio de Janeiro',
      emailCentral: 'central@puc-rio.br',
      telefoneCentral: '(21) 3527-1001',
      reitor: 'Prof. Reitor PUC-Rio',
      status: 'ATIVO'
    },
    {
      id: 4,
      sigla: 'PUC-SP',
      nome: 'Pontifícia Universidade Católica de São Paulo',
      emailCentral: 'central@pucsp.br',
      telefoneCentral: '(11) 3670-8000',
      reitor: 'Prof. Reitor PUC-SP',
      status: 'ATIVO'
    }
  ];

  carregandoIes = false;
  salvandoIes = false;
  mensagemIes = '';
  tipoMensagemIes: 'sucesso' | 'erro' | '' = '';

  novaIes: Ies = {
    sigla: '',
    nome: '',
    emailCentral: '',
    telefoneCentral: '',
    reitor: '',
    proReitorias: ''
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // Verificação de perfil
  temPerfil(perfilProcurado: string): boolean {
    if (!this.usuarioLogado || !this.usuarioLogado.perfis) {
      return false;
    }

    return this.usuarioLogado.perfis.includes(perfilProcurado) ||
      this.usuarioLogado.perfis.includes(`ROLE_${perfilProcurado}`);
  }

  // Navegação e login
  entrar(): void {
    this.mostrarLogin = true;
    this.mensagemLogin = '';
  }

  voltarInicio(): void {
    this.mostrarLogin = false;
    this.mensagemLogin = '';
  }

  sair(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    this.usuarioLogado = null;
    this.login = '';
    this.senha = '';
    this.mensagemLogin = '';
    this.mostrarLogin = false;

    this.cdr.detectChanges();
  }

  // Login simulado original
  fazerLogin(): void {
    if (!this.login.trim() || !this.senha.trim()) {
      this.mensagemLogin = 'Preencha o login e a senha.';
      return;
    }

    this.carregando = true;
    this.mensagemLogin = '';

    setTimeout(() => {
      this.carregando = false;

      const usuarioAdmin: RespostaLogin['usuario'] = {
        id: 1,
        login: this.login.trim(),
        nome: 'Administrador do Sistema',
        perfis: ['ADMINISTRADOR', 'ADMIN'],
        docenteId: null,
        discenteId: null
      };

      this.usuarioLogado = usuarioAdmin;
      this.mostrarLogin = false;
      this.senha = '';

      this.cdr.detectChanges();
    }, 400);
  }

  // Monitorias
  carregarMonitorias(): void {}

  // Disciplinas
  abrirCadastroDisciplina(): void {
    this.mostrarCadastroDisciplina = true;
  }

  cancelarCadastroDisciplina(): void {
    this.mostrarCadastroDisciplina = false;
  }

  // Instituições de Ensino Superior
  carregarIes(): void {}

  cadastrarIes(): void {
    if (
      !this.novaIes.sigla.trim() ||
      !this.novaIes.nome.trim() ||
      !this.novaIes.emailCentral.trim() ||
      !this.novaIes.telefoneCentral.trim() ||
      !this.novaIes.reitor.trim()
    ) {
      this.mensagemIes =
        'Preencha todos os campos obrigatórios (Sigla, Nome, E-mail, Telefone e Reitor).';
      this.tipoMensagemIes = 'erro';
      return;
    }

    const nova: Ies = {
      id: this.listaIes.length + 1,
      sigla: this.novaIes.sigla.trim(),
      nome: this.novaIes.nome.trim(),
      emailCentral: this.novaIes.emailCentral.trim(),
      telefoneCentral: this.novaIes.telefoneCentral.trim(),
      reitor: this.novaIes.reitor.trim(),
      proReitorias: this.novaIes.proReitorias,
      status: 'ATIVO'
    };

    this.listaIes.unshift(nova);
    this.mensagemIes = 'Instituição (IES) cadastrada com sucesso!';
    this.tipoMensagemIes = 'sucesso';

    this.novaIes = {
      sigla: '',
      nome: '',
      emailCentral: '',
      telefoneCentral: '',
      reitor: '',
      proReitorias: ''
    };

    this.cdr.detectChanges();
  }

  alternarStatusIes(ies: Ies): void {
    ies.status = ies.status === 'INATIVO' ? 'ATIVO' : 'INATIVO';
    this.cdr.detectChanges();
  }

  // Cabeçalhos das requisições autenticadas
  private cabecalhosCA() {
    const token = localStorage.getItem('token');

    return {
      headers: {
        Authorization: `Bearer ${token || ''}`
      }
    };
  }

  // Centros Acadêmicos
  carregarCA(): void {
    this.carregandoCA = true;
    this.mensagemCA = '';
    this.tipoMensagemCA = '';

    let url = 'http://localhost:8080/api/centros-academicos';

    if (this.filtroIesCA !== null) {
      url += `?iesId=${this.filtroIesCA}`;
    }

    this.http.get<any[]>(url, this.cabecalhosCA()).subscribe({
      next: (resposta) => {
        this.listaCentrosAcademicos = resposta.map((ca: any) => ({
          id: ca.id,
          sigla: ca.sigla,
          nome: ca.nome,
          emailCentral: ca.email ?? ca.emailCentral ?? '',
          telefoneCentral: ca.telefone ?? ca.telefoneCentral ?? '',
          coordenador: ca.coordenador ?? '',
          iesId: ca.iesId ?? ca.ies?.id,
          iesNome: ca.iesNome ?? ca.ies?.nome ?? ca.iesSigla ?? '',
          iesSigla: ca.iesSigla ?? ca.ies?.sigla ?? '',
          dataCadastramento: ca.dataCadastro ?? ca.dataCadastramento ?? '',
          status: typeof ca.status === 'string'
            ? ca.status
            : ca.status?.nome ?? ''
        }));

        this.carregandoCA = false;
        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        this.carregandoCA = false;
        this.listaCentrosAcademicos = [];

        this.mensagemCA =
          erro.status === 0
            ? 'Não foi possível conectar ao back-end. Verifique se o Spring Boot está rodando.'
            : erro.status === 401
              ? 'Sessão não autenticada.'
              : erro.status === 403
                ? 'Acesso negado. O login simulado não gera um token real.'
                : erro.error?.message ||
                  erro.error?.mensagem ||
                  `Não foi possível carregar os Centros Acadêmicos. HTTP ${erro.status}.`;

        this.tipoMensagemCA = 'erro';
        console.error('Erro ao carregar CAs:', erro);
        this.cdr.detectChanges();
      }
    });
  }

  abrirEdicaoCA(ca: CentroAcademico): void {
    if (!ca.id) {
      this.mensagemCA = 'Centro Acadêmico não identificado.';
      this.tipoMensagemCA = 'erro';
      return;
    }

    this.editandoCAId = ca.id;

    this.novoCA = {
      sigla: ca.sigla ?? '',
      nome: ca.nome ?? '',
      emailCentral: ca.emailCentral ?? '',
      telefoneCentral: ca.telefoneCentral ?? '',
      coordenador: ca.coordenador ?? '',
      iesId: ca.iesId ?? null
    };

    this.mensagemCA = '';
    this.tipoMensagemCA = '';
    this.cdr.detectChanges();
  }

  salvarCA(): void {
    const ca = this.novoCA;

    if (
      !ca.sigla.trim() ||
      !ca.nome.trim() ||
      !ca.emailCentral.trim() ||
      !ca.telefoneCentral.trim() ||
      !ca.coordenador.trim() ||
      ca.iesId === null
    ) {
      this.mensagemCA =
        'Preencha todos os campos e selecione a IES vinculada.';
      this.tipoMensagemCA = 'erro';
      return;
    }

    this.salvandoCA = true;
    this.mensagemCA = '';
    this.tipoMensagemCA = '';

    const dados = {
      sigla: ca.sigla.trim(),
      nome: ca.nome.trim(),
      email: ca.emailCentral.trim(),
      telefone: ca.telefoneCentral.trim(),
      coordenador: ca.coordenador.trim(),
      iesId: Number(ca.iesId)
    };

    const requisicao = this.editandoCAId !== null
      ? this.http.put(
          `http://localhost:8080/api/centros-academicos/${this.editandoCAId}`,
          dados,
          this.cabecalhosCA()
        )
      : this.http.post(
          'http://localhost:8080/api/centros-academicos',
          dados,
          this.cabecalhosCA()
        );

    requisicao.subscribe({
      next: () => {
        const estavaEditando = this.editandoCAId !== null;

        this.salvandoCA = false;
        this.mensagemCA = estavaEditando
          ? 'Centro Acadêmico atualizado com sucesso!'
          : 'Centro Acadêmico cadastrado com sucesso!';
        this.tipoMensagemCA = 'sucesso';

        this.limparFormularioCA();
        this.carregarCA();
        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        this.salvandoCA = false;

        this.mensagemCA =
          erro.status === 0
            ? 'Não foi possível conectar ao back-end.'
            : erro.status === 400
              ? erro.error?.message ||
                erro.error?.mensagem ||
                'Dados inválidos. Confira os campos preenchidos.'
              : erro.status === 401
                ? 'Sessão não autenticada.'
                : erro.status === 403
                  ? 'Acesso negado. O back-end exige o perfil ADMINISTRADOR.'
                  : erro.error?.message ||
                    erro.error?.mensagem ||
                    `Erro ao salvar Centro Acadêmico. HTTP ${erro.status}.`;

        this.tipoMensagemCA = 'erro';
        console.error('Erro ao salvar CA:', erro);
        this.cdr.detectChanges();
      }
    });
  }

  limparFormularioCA(): void {
    this.editandoCAId = null;

    this.novoCA = {
      sigla: '',
      nome: '',
      emailCentral: '',
      telefoneCentral: '',
      coordenador: '',
      iesId: null
    };

    this.cdr.detectChanges();
  }

  confirmarStatusCA(): void {
    const ca = this.caSelecionadoStatus;

    if (!ca || !ca.id) {
      this.mensagemStatusCA = 'Centro Acadêmico não identificado.';
      return;
    }

    if (!this.motivoStatusCA.trim()) {
      this.mensagemStatusCA = 'Informe o motivo da alteração.';
      return;
    }

    this.salvandoStatusCA = true;
    this.mensagemStatusCA = '';

    const acao = ca.status === 'ATIVO' ? 'inativar' : 'ativar';

    this.http.patch(
      `http://localhost:8080/api/centros-academicos/${ca.id}/${acao}`,
      { motivo: this.motivoStatusCA.trim() },
      this.cabecalhosCA()
    ).subscribe({
      next: () => {
        this.salvandoStatusCA = false;
        this.caSelecionadoStatus = null;
        this.motivoStatusCA = '';
        this.mensagemStatusCA = '';

        this.mensagemCA =
          'Status do Centro Acadêmico alterado com sucesso!';
        this.tipoMensagemCA = 'sucesso';

        this.carregarCA();
        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        this.salvandoStatusCA = false;

        this.mensagemStatusCA =
          erro.status === 0
            ? 'Não foi possível conectar ao back-end.'
            : erro.status === 400
              ? erro.error?.message ||
                erro.error?.mensagem ||
                'Informe um motivo válido para a alteração.'
              : erro.status === 401
                ? 'Sessão não autenticada.'
                : erro.status === 403
                  ? 'Acesso negado. Verifique as permissões do administrador.'
                  : erro.error?.message ||
                    erro.error?.mensagem ||
                    `Não foi possível alterar o status. HTTP ${erro.status}.`;

        this.cdr.detectChanges();
      }
    });
  }

  cancelarAlteracaoStatusCA(): void {
    this.caSelecionadoStatus = null;
    this.motivoStatusCA = '';
    this.mensagemStatusCA = '';
    this.salvandoStatusCA = false;
    this.cdr.detectChanges();
  }

  // ================= CURSOS  ================= //

  carregarCursosAdmin(): void {
    this.carregandoCursosAdmin = true;
    this.mensagemCursoAdmin = '';
    this.tipoMensagemCursoAdmin = '';

    this.http.get<any[]>(
      'http://localhost:8080/api/cursos',
      this.cabecalhosCA()
    ).subscribe({
      next: (dados) => {
        this.cursosAdmin = dados.map((curso: any) => ({
          id: curso.id,
          sigla: curso.sigla,
          descricao: curso.descricao,
          centroAcademicoId:
            curso.centroAcademicoId ??
            curso.centroAcademico?.id ??
            0,
          centroAcademicoSigla:
            curso.centroAcademicoSigla ??
            curso.centroAcademico?.sigla ??
            '',
          iesSigla:
            curso.iesSigla ??
            curso.centroAcademico?.iesSigla ??
            '',
          turnos: Array.isArray(curso.turnos)
            ? curso.turnos.map((turno: any) =>
                typeof turno === 'string'
                  ? turno
                  : turno.nome ?? turno.turno ?? String(turno)
              )
            : [],
          coordenador: curso.coordenador ?? '',
          dataCadastro: curso.dataCadastro ?? '',
          status:
            typeof curso.status === 'string'
              ? curso.status
              : curso.status?.nome ?? ''
        }));

        this.carregandoCursosAdmin = false;
        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        this.carregandoCursosAdmin = false;

        this.mensagemCursoAdmin =
          erro.status === 0
            ? 'Não foi possível conectar ao back-end. Verifique se o Spring Boot está rodando.'
            : erro.status === 401
              ? 'Sessão não autenticada. O login atual é simulado e não gera um token real.'
              : erro.status === 403
                ? 'Acesso negado. Verifique as permissões do administrador.'
                : erro.error?.message ||
                  erro.error?.mensagem ||
                  `Não foi possível carregar os cursos. HTTP ${erro.status}.`;

        this.tipoMensagemCursoAdmin = 'erro';
        console.error('Erro ao carregar cursos:', erro);
        this.cdr.detectChanges();
      }
    });
  }

  carregarCentrosAcademicosCurso(): void {
    this.http.get<any[]>(
      'http://localhost:8080/api/centros-academicos',
      this.cabecalhosCA()
    ).subscribe({
      next: (dados) => {
        this.centrosAcademicosCurso = dados.map((ca: any) => ({
          id: ca.id,
          sigla: ca.sigla,
          descricao: ca.descricao ?? ca.nome ?? ca.sigla
        }));

        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        this.mensagemCursoAdmin =
          erro.status === 0
            ? 'Não foi possível conectar ao back-end para carregar os Centros Acadêmicos.'
            : erro.status === 401
              ? 'Sessão não autenticada ao carregar os Centros Acadêmicos.'
              : erro.status === 403
                ? 'Você não tem permissão para consultar os Centros Acadêmicos.'
                : `Erro ao carregar Centros Acadêmicos. HTTP ${erro.status}.`;

        this.tipoMensagemCursoAdmin = 'erro';
        console.error('Erro ao carregar Centros Acadêmicos:', erro);
        this.cdr.detectChanges();
      }
    });
  }

  alternarTurnoCurso(turno: string, marcado: boolean): void {
    if (marcado) {
      if (!this.novoCursoAdmin.turnos.includes(turno)) {
        this.novoCursoAdmin.turnos.push(turno);
      }
    } else {
      this.novoCursoAdmin.turnos =
        this.novoCursoAdmin.turnos.filter(
          (turnoAtual) => turnoAtual !== turno
        );
    }
  }

  salvarCursoAdmin(): void {
    const curso = this.novoCursoAdmin;

    if (
      !curso.sigla.trim() ||
      !curso.descricao.trim() ||
      !curso.coordenador.trim() ||
      !curso.centroAcademicoId ||
      curso.turnos.length === 0
    ) {
      this.mensagemCursoAdmin =
        'Preencha a sigla, a descrição, o Centro Acadêmico, o coordenador e pelo menos um turno.';
      this.tipoMensagemCursoAdmin = 'erro';
      return;
    }

    this.salvandoCursoAdmin = true;
    this.mensagemCursoAdmin = '';
    this.tipoMensagemCursoAdmin = '';

    const dados = {
      sigla: curso.sigla.trim(),
      descricao: curso.descricao.trim(),
      centroAcademicoId: Number(curso.centroAcademicoId),
      turnos: curso.turnos,
      coordenador: curso.coordenador.trim()
    };

    const requisicao = this.editandoCursoAdminId !== null
      ? this.http.put(
          `http://localhost:8080/api/cursos/${this.editandoCursoAdminId}`,
          dados,
          this.cabecalhosCA()
        )
      : this.http.post(
          'http://localhost:8080/api/cursos',
          dados,
          this.cabecalhosCA()
        );

    requisicao.subscribe({
      next: () => {
        this.salvandoCursoAdmin = false;
        this.mensagemCursoAdmin = 'Curso salvo com sucesso!';
        this.tipoMensagemCursoAdmin = 'sucesso';

        this.limparFormularioCursoAdmin();
        this.carregarCursosAdmin();
        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        this.salvandoCursoAdmin = false;

        this.mensagemCursoAdmin =
          erro.status === 0
            ? 'Não foi possível conectar ao back-end.'
            : erro.status === 400
              ? erro.error?.message ||
                erro.error?.mensagem ||
                'Dados inválidos. Confira os campos do curso.'
              : erro.status === 401
                ? 'Sessão não autenticada. O login simulado não gera um token real.'
                : erro.status === 403
                  ? 'Acesso negado. Verifique as permissões de administrador.'
                  : erro.error?.message ||
                    erro.error?.mensagem ||
                    `Erro ao salvar curso. HTTP ${erro.status}.`;

        this.tipoMensagemCursoAdmin = 'erro';
        console.error('Erro ao salvar curso:', erro);
        this.cdr.detectChanges();
      }
    });
  }

  editarCursoAdmin(curso: Curso): void {
    this.editandoCursoAdminId = curso.id;

    this.novoCursoAdmin = {
      sigla: curso.sigla,
      descricao: curso.descricao,
      centroAcademicoId: curso.centroAcademicoId ?? 0,
      turnos: [...(curso.turnos ?? [])],
      coordenador: curso.coordenador ?? ''
    };

    this.mensagemCursoAdmin = '';
    this.tipoMensagemCursoAdmin = '';
    this.cdr.detectChanges();
  }

  limparFormularioCursoAdmin(): void {
    this.editandoCursoAdminId = null;

    this.novoCursoAdmin = {
      sigla: '',
      descricao: '',
      centroAcademicoId: 0,
      turnos: [],
      coordenador: ''
    };

    this.cdr.detectChanges();
  }

  // ============ DOCENTES ============== //

  carregarDocentes(): void {
    this.carregandoDocentes = true;
    this.mensagemDocente = '';
    this.tipoMensagemDocente = '';

    this.http.get<any[]>(
      'http://localhost:8080/api/docentes',
      this.cabecalhosCA()
    ).subscribe({
      next: (dados) => {
        this.docentesAdmin = dados.map((docente: any) => ({
          id: docente.id,
          matricula: docente.matricula,
          nome: docente.nome,
          email: docente.email,
          telefone: docente.telefone,
          centroAcademicoId: docente.centroAcademicoId,
          centroAcademicoSigla: docente.centroAcademicoSigla ?? '',
          login: docente.login ?? docente.matricula,
          dataCadastro: docente.dataCadastro ?? '',
          status:
            typeof docente.status === 'string'
              ? docente.status
              : docente.status?.nome ?? ''
        }));

        this.carregandoDocentes = false;
        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        this.carregandoDocentes = false;

        this.mensagemDocente =
          erro.status === 0
            ? 'Não foi possível conectar ao back-end. Verifique se o Spring Boot está rodando.'
            : erro.status === 401
              ? 'Sessão não autenticada. O login simulado não gera um token real.'
              : erro.status === 403
                ? 'Acesso negado. O back-end exige o perfil ADMINISTRADOR.'
                : erro.error?.message ||
                  erro.error?.mensagem ||
                  `Não foi possível carregar os docentes. HTTP ${erro.status}.`;

        this.tipoMensagemDocente = 'erro';
        console.error('Erro ao carregar docentes:', erro);
        this.cdr.detectChanges();
      }
    });
  }

  carregarCentrosAcademicosDocente(): void {
    this.http.get<any[]>(
      'http://localhost:8080/api/centros-academicos',
      this.cabecalhosCA()
    ).subscribe({
      next: (dados) => {
        this.centrosAcademicosDocente = dados
          .filter((ca: any) => {
            const status =
              typeof ca.status === 'string'
                ? ca.status
                : ca.status?.nome;

            return status === 'ATIVO';
          })
          .map((ca: any) => ({
            id: ca.id,
            sigla: ca.sigla,
            descricao: ca.nome ?? ca.descricao ?? ca.sigla
          }));

        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        this.mensagemDocente =
          erro.status === 0
            ? 'Não foi possível conectar ao back-end para carregar os Centros Acadêmicos.'
            : erro.status === 401
              ? 'Sessão não autenticada ao carregar os Centros Acadêmicos.'
              : erro.status === 403
                ? 'Você não tem permissão para consultar os Centros Acadêmicos.'
                : `Erro ao carregar Centros Acadêmicos. HTTP ${erro.status}.`;

        this.tipoMensagemDocente = 'erro';
        console.error('Erro ao carregar Centros Acadêmicos dos docentes:', erro);
        this.cdr.detectChanges();
      }
    });
  }

  salvarDocenteAdmin(): void {
    const docente = this.novoDocente;

    if (
      !docente.matricula.trim() ||
      !docente.nome.trim() ||
      !docente.email.trim() ||
      !docente.telefone.trim() ||
      !docente.centroAcademicoId
    ) {
      this.mensagemDocente =
        'Preencha matrícula, nome, e-mail, telefone e Centro Acadêmico.';
      this.tipoMensagemDocente = 'erro';
      return;
    }

    if (
      docente.senhaInicial.trim() !== '' &&
      docente.senhaInicial.trim().length < 6
    ) {
      this.mensagemDocente =
        'A senha inicial deve ter pelo menos 6 caracteres.';
      this.tipoMensagemDocente = 'erro';
      return;
    }

    this.salvandoDocente = true;
    this.mensagemDocente = '';
    this.tipoMensagemDocente = '';

    const dados: any = {
      matricula: docente.matricula.trim(),
      nome: docente.nome.trim(),
      email: docente.email.trim(),
      telefone: docente.telefone.trim(),
      centroAcademicoId: Number(docente.centroAcademicoId)
    };

    if (docente.senhaInicial.trim()) {
      dados.senhaInicial = docente.senhaInicial.trim();
    }

    const requisicao = this.editandoDocenteId !== null
      ? this.http.put(
          `http://localhost:8080/api/docentes/${this.editandoDocenteId}`,
          dados,
          this.cabecalhosCA()
        )
      : this.http.post(
          'http://localhost:8080/api/docentes',
          dados,
          this.cabecalhosCA()
        );

    requisicao.subscribe({
      next: () => {
        this.salvandoDocente = false;
        this.mensagemDocente = this.editandoDocenteId !== null
          ? 'Docente atualizado com sucesso!'
          : 'Docente cadastrado com sucesso!';
        this.tipoMensagemDocente = 'sucesso';

        this.limparFormularioDocenteAdmin();
        this.carregarDocentes();
        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        this.salvandoDocente = false;

        this.mensagemDocente =
          erro.status === 0
            ? 'Não foi possível conectar ao back-end.'
            : erro.status === 400
              ? erro.error?.message ||
                erro.error?.mensagem ||
                'Dados inválidos. Confira os campos preenchidos.'
              : erro.status === 401
                ? 'Sessão não autenticada. O login simulado não gera um token real.'
                : erro.status === 403
                  ? 'Acesso negado. Verifique as permissões do administrador.'
                  : erro.error?.message ||
                    erro.error?.mensagem ||
                    `Erro ao salvar docente. HTTP ${erro.status}.`;

        this.tipoMensagemDocente = 'erro';
        console.error('Erro ao salvar docente:', erro);
        this.cdr.detectChanges();
      }
    });
  }

  editarDocenteAdmin(docente: Docente): void {
    this.editandoDocenteId = docente.id;

    this.novoDocente = {
      matricula: docente.matricula,
      nome: docente.nome,
      email: docente.email,
      telefone: docente.telefone,
      centroAcademicoId: docente.centroAcademicoId ?? 0,
      senhaInicial: ''
    };

    this.mensagemDocente = '';
    this.tipoMensagemDocente = '';
    this.cdr.detectChanges();
  }

  limparFormularioDocenteAdmin(): void {
    this.editandoDocenteId = null;

    this.novoDocente = {
      matricula: '',
      nome: '',
      email: '',
      telefone: '',
      centroAcademicoId: 0,
      senhaInicial: ''
    };

    this.cdr.detectChanges();
  }

  abrirStatusDocente(docente: Docente): void {
    this.docenteSelecionadoStatus = docente;
    this.motivoStatusDocente = '';
    this.mensagemStatusDocente = '';
    this.salvandoStatusDocente = false;
  }

  confirmarStatusDocente(): void {
    const docente = this.docenteSelecionadoStatus;

    if (!docente || !docente.id) {
      this.mensagemStatusDocente = 'Docente não identificado.';
      return;
    }

    if (!this.motivoStatusDocente.trim()) {
      this.mensagemStatusDocente =
        'Informe o motivo da alteração de status.';
      return;
    }

    this.salvandoStatusDocente = true;
    this.mensagemStatusDocente = '';

    const acao = docente.status === 'ATIVO' ? 'inativar' : 'ativar';

    this.http.patch(
      `http://localhost:8080/api/docentes/${docente.id}/${acao}`,
      { motivo: this.motivoStatusDocente.trim() },
      this.cabecalhosCA()
    ).subscribe({
      next: () => {
        this.salvandoStatusDocente = false;
        this.docenteSelecionadoStatus = null;
        this.motivoStatusDocente = '';
        this.mensagemStatusDocente = '';

        this.mensagemDocente =
          'Status do docente alterado com sucesso!';
        this.tipoMensagemDocente = 'sucesso';

        this.carregarDocentes();
        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        this.salvandoStatusDocente = false;

        this.mensagemStatusDocente =
          erro.status === 0
            ? 'Não foi possível conectar ao back-end.'
            : erro.status === 400
              ? erro.error?.message ||
                erro.error?.mensagem ||
                'Informe um motivo válido para a alteração.'
              : erro.status === 401
                ? 'Sessão não autenticada. O login simulado não gera um token real.'
                : erro.status === 403
                  ? 'Acesso negado. Verifique as permissões do administrador.'
                  : erro.error?.message ||
                    erro.error?.mensagem ||
                    `Não foi possível alterar o status. HTTP ${erro.status}.`;

        console.error('Erro ao alterar status do docente:', erro);
        this.cdr.detectChanges();
      }
    });
  }

  cancelarAlteracaoStatusDocente(): void {
    this.docenteSelecionadoStatus = null;
    this.motivoStatusDocente = '';
    this.mensagemStatusDocente = '';
    this.salvandoStatusDocente = false;
    this.cdr.detectChanges();
  }

  // ========== LOGS DE AUDITORIA  ============= //

  carregarLogs(): void {
    this.carregandoLogs = true;
    this.mensagemLogs = '';

    const params: {
      page: number;
      size: number;
      usuario?: string;
    } = {
      page: this.paginaLogs,
      size: this.tamanhoPaginaLogs
    };

    if (this.filtroUsuarioLogs.trim()) {
      params.usuario = this.filtroUsuarioLogs.trim();
    }

    this.http.get<PaginaLogs>(
      'http://localhost:8080/api/auditoria',
      {
        ...this.cabecalhosCA(),
        params
      }
    ).subscribe({
      next: (resposta) => {
        this.logsAuditoria = resposta.content ?? [];
        this.totalPaginasLogs = resposta.totalPages ?? 0;
        this.totalRegistrosLogs = resposta.totalElements ?? 0;
        this.paginaLogs = resposta.number ?? this.paginaLogs;
        this.carregandoLogs = false;

        if (this.logsAuditoria.length === 0) {
          this.mensagemLogs =
            'Nenhum registro de auditoria encontrado.';
        }

        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        this.carregandoLogs = false;
        this.logsAuditoria = [];

        this.mensagemLogs =
          erro.status === 0
            ? 'Não foi possível conectar ao back-end. Verifique se o Spring Boot está rodando.'
            : erro.status === 401
              ? 'Sessão não autenticada.'
              : erro.status === 403
                ? 'Acesso negado. A consulta aos logs exige o perfil ADMINISTRADOR.'
                : erro.error?.message ||
                  erro.error?.mensagem ||
                  `Não foi possível carregar os logs. HTTP ${erro.status}.`;

        console.error('Erro ao carregar logs de auditoria:', erro);
        this.cdr.detectChanges();
      }
    });
  }

  pesquisarLogs(): void {
    this.paginaLogs = 0;
    this.carregarLogs();
  }

  atualizarLogs(): void {
    this.carregarLogs();
  }

  paginaAnteriorLogs(): void {
    if (this.paginaLogs > 0) {
      this.paginaLogs--;
      this.carregarLogs();
    }
  }

  proximaPaginaLogs(): void {
    if (this.paginaLogs + 1 < this.totalPaginasLogs) {
      this.paginaLogs++;
      this.carregarLogs();
    }
  }
  gerarRelatorioCompleto(): void {
  this.tipoRelatorio = 'completo';
  this.mensagemRelatorio = '';
  this.carregandoRelatorio = true;
  this.hojeRelatorio = new Date();

  this.centrosRelatorio = [...this.listaCentrosAcademicos];
  this.cursosRelatorio = [...this.cursosAdmin];

  this.nomeAdministradorRelatorio =
    this.usuarioLogado?.nome || 'Administrador';

  this.carregandoRelatorio = false;
}

gerarRelatorioDocentes(): void {
  this.tipoRelatorio = 'docentes';
  this.mensagemRelatorio = '';
  this.carregandoRelatorio = true;
  this.hojeRelatorio = new Date();

  this.docentesRelatorio = [...this.docentesAdmin];
  this.filtroStatusRelatorio = 'TODOS';

  this.nomeAdministradorRelatorio =
    this.usuarioLogado?.nome || 'Administrador';

  this.carregandoRelatorio = false;
}

contarDocentesPorStatus(status?: string): number {
  const docentes = this.docentesRelatorio || [];

  if (status) {
    return docentes.filter(
      docente => docente.status === status
    ).length;
  }

  if (this.filtroStatusRelatorio === 'TODOS') {
    return docentes.length;
  }

  return docentes.filter(
    docente => docente.status === this.filtroStatusRelatorio
  ).length;
}

imprimirRelatorio(): void {
  if (!this.tipoRelatorio) {
    this.mensagemRelatorio =
      'Gere um relatório antes de imprimir.';
    return;
  }

  window.print();
}
}