// Gerado a partir do banco (Supabase generate_typescript_types). Não editar à mão:
// regenerar sempre que uma migração mudar tabelas, funções ou enums.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type PapelUsuario = "admin" | "coordenador" | "montador"
type SituacaoAjudante = "pendente" | "ativo" | "inativo"
type TipoChavePix = "cpf" | "cnpj" | "email" | "telefone" | "aleatoria"

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ajudantes: {
        Row: {
          atualizado_em: string
          coordenador_id: string
          criado_em: string
          criado_por: string | null
          id: string
          nome: string
          situacao: SituacaoAjudante
          telefone: string | null
        }
        Insert: {
          atualizado_em?: string
          coordenador_id: string
          criado_em?: string
          criado_por?: string | null
          id?: string
          nome: string
          situacao?: SituacaoAjudante
          telefone?: string | null
        }
        Update: {
          atualizado_em?: string
          coordenador_id?: string
          criado_em?: string
          criado_por?: string | null
          id?: string
          nome?: string
          situacao?: SituacaoAjudante
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ajudantes_coordenador_id_fkey"
            columns: ["coordenador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      auditoria: {
        Row: {
          acao: string
          antes: Json | null
          depois: Json | null
          id: number
          quando: string
          registro_id: string
          tabela: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          antes?: Json | null
          depois?: Json | null
          id?: never
          quando?: string
          registro_id: string
          tabela: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          antes?: Json | null
          depois?: Json | null
          id?: never
          quando?: string
          registro_id?: string
          tabela?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      dados_bancarios: {
        Row: {
          ajudante_id: string | null
          atualizado_em: string
          chave_pix: string
          cpf: string | null
          criado_em: string
          criado_por: string | null
          id: string
          tipo_chave_pix: TipoChavePix
        }
        Insert: {
          ajudante_id?: string | null
          atualizado_em?: string
          chave_pix: string
          cpf?: string | null
          criado_em?: string
          criado_por?: string | null
          id?: string
          tipo_chave_pix: TipoChavePix
        }
        Update: {
          ajudante_id?: string | null
          atualizado_em?: string
          chave_pix?: string
          cpf?: string | null
          criado_em?: string
          criado_por?: string | null
          id?: string
          tipo_chave_pix?: TipoChavePix
        }
        Relationships: [
          {
            foreignKeyName: "dados_bancarios_ajudante_id_fkey"
            columns: ["ajudante_id"]
            isOneToOne: true
            referencedRelation: "ajudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos: {
        Row: {
          ativo: boolean
          atualizado_em: string
          cnpj: string
          codigo: string
          criado_em: string
          criado_por: string | null
          id: string
          razao_social: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          cnpj: string
          codigo: string
          criado_em?: string
          criado_por?: string | null
          id?: string
          razao_social: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          cnpj?: string
          codigo?: string
          criado_em?: string
          criado_por?: string | null
          id?: string
          razao_social?: string
        }
        Relationships: []
      }
      hoteis: {
        Row: {
          atualizado_em: string
          cidade: string | null
          criado_em: string
          criado_por: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          uf: string | null
        }
        Insert: {
          atualizado_em?: string
          cidade?: string | null
          criado_em?: string
          criado_por?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          uf?: string | null
        }
        Update: {
          atualizado_em?: string
          cidade?: string | null
          criado_em?: string
          criado_por?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          uf?: string | null
        }
        Relationships: []
      }
      parques: {
        Row: {
          ativo: boolean
          atualizado_em: string
          cidade: string | null
          coordenador_id: string | null
          criado_em: string
          criado_por: string | null
          grupo_id: string
          id: string
          nome: string
          shopping_atual: string | null
          uf: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          cidade?: string | null
          coordenador_id?: string | null
          criado_em?: string
          criado_por?: string | null
          grupo_id: string
          id?: string
          nome: string
          shopping_atual?: string | null
          uf?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          cidade?: string | null
          coordenador_id?: string | null
          criado_em?: string
          criado_por?: string | null
          grupo_id?: string
          id?: string
          nome?: string
          shopping_atual?: string | null
          uf?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parques_coordenador_id_fkey"
            columns: ["coordenador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parques_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean
          atualizado_em: string
          coordenador_id: string | null
          criado_em: string
          criado_por: string | null
          email: string
          id: string
          nome: string
          papel: PapelUsuario
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          coordenador_id?: string | null
          criado_em?: string
          criado_por?: string | null
          email: string
          id: string
          nome: string
          papel: PapelUsuario
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          coordenador_id?: string | null
          criado_em?: string
          criado_por?: string | null
          email?: string
          id?: string
          nome?: string
          papel?: PapelUsuario
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_coordenador_id_fkey"
            columns: ["coordenador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      dados_bancarios_da_equipe: {
        Args: never
        Returns: {
          ajudante_id: string
          chave_pix_mascarada: string
          cpf_mascarado: string
          tipo_chave_pix: TipoChavePix
        }[]
      }
    }
    Enums: {
      papel_usuario: PapelUsuario
      situacao_ajudante: SituacaoAjudante
      tipo_chave_pix: TipoChavePix
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tabela<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type Papel = PapelUsuario
export type Situacao = SituacaoAjudante
export type TipoPix = TipoChavePix
