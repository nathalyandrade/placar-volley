/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Endereço da API .NET, se ela estiver em outro servidor. Padrão: ./api. Vazio desliga a sincronização. */
  readonly VITE_API_URL?: string
}
