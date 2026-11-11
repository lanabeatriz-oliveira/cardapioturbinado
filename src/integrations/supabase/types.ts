export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      analises: {
        Row: {
          consentimento: boolean | null
          criado_em: string | null
          data_followup: string | null
          dias_followup: number | null
          followup_enviado: boolean | null
          id: string
          nome_dono: string | null
          nome_hamburgueria: string | null
          nota_geral: number | null
          numeros: Json | null
          token: string | null
          whatsapp: string | null
        }
        Insert: {
          consentimento?: boolean | null
          criado_em?: string | null
          data_followup?: string | null
          dias_followup?: number | null
          followup_enviado?: boolean | null
          id?: string
          nome_dono?: string | null
          nome_hamburgueria?: string | null
          nota_geral?: number | null
          numeros?: Json | null
          token?: string | null
          whatsapp?: string | null
        }
        Update: {
          consentimento?: boolean | null
          criado_em?: string | null
          data_followup?: string | null
          dias_followup?: number | null
          followup_enviado?: boolean | null
          id?: string
          nome_dono?: string | null
          nome_hamburgueria?: string | null
          nota_geral?: number | null
          numeros?: Json | null
          token?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      concorrentes: {
        Row: {
          analise_id: string | null
          criado_em: string | null
          id: string
          nome: string | null
          nota_geral: number | null
          notas_criterios: Json | null
          numeros: Json | null
        }
        Insert: {
          analise_id?: string | null
          criado_em?: string | null
          id?: string
          nome?: string | null
          nota_geral?: number | null
          notas_criterios?: Json | null
          numeros?: Json | null
        }
        Update: {
          analise_id?: string | null
          criado_em?: string | null
          id?: string
          nome?: string | null
          nota_geral?: number | null
          notas_criterios?: Json | null
          numeros?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "concorrentes_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "analises"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          analise_id: string | null
          aplicou_mudancas: boolean | null
          comentario: string | null
          criado_em: string | null
          id: string
          momento: string | null
          pedidos_semana_antes: number | null
          pedidos_semana_depois: number | null
          sugestoes_aplicadas: string | null
          utilidade: number | null
        }
        Insert: {
          analise_id?: string | null
          aplicou_mudancas?: boolean | null
          comentario?: string | null
          criado_em?: string | null
          id?: string
          momento?: string | null
          pedidos_semana_antes?: number | null
          pedidos_semana_depois?: number | null
          sugestoes_aplicadas?: string | null
          utilidade?: number | null
        }
        Update: {
          analise_id?: string | null
          aplicou_mudancas?: boolean | null
          comentario?: string | null
          criado_em?: string | null
          id?: string
          momento?: string | null
          pedidos_semana_antes?: number | null
          pedidos_semana_depois?: number | null
          sugestoes_aplicadas?: string | null
          utilidade?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "analises"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analysis_by_token: {
        Args: { p_token: string }
        Returns: {
          id: string
          nome_hamburgueria: string
          nota_geral: number
          numeros: Json
        }[]
      }
      is_lana_admin: { Args: never; Returns: boolean }
      save_competitors: {
        Args: { p_rows: Json; p_token: string }
        Returns: undefined
      }
      submit_feedback: {
        Args: {
          p_antes?: number
          p_aplicou?: boolean
          p_comentario?: string
          p_depois?: number
          p_momento: string
          p_sugestoes?: string
          p_token: string
          p_utilidade?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
