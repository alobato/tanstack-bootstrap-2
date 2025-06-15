# Tutorial: Implementando Paraglide em um Novo Projeto

## 1. Instalação

Primeiro, instale as dependências necessárias:

```bash
pnpm add -D @inlang/paraglide-js @inlang/paraglide-vite
```

## 2. Configuração do Projeto

### 2.1. Criar arquivo de configuração do Paraglide

Crie um arquivo `project.inlang.json` na raiz do projeto:

```json
{
  "$schema": "https://inlang.com/schema/inlang-message-format",
  "sourceLanguageTag": "en",
  "languageTags": ["en", "pt", "es", "de"],
  "modules": [
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-empty-pattern@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-identical-pattern@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js"
  ]
}
```

### 2.2. Configurar o Vite

Adicione o plugin do Paraglide no seu arquivo de configuração do Vite (`vite.config.ts`):

```typescript
import { defineConfig } from 'vite'
import { paraglide } from '@inlang/paraglide-vite'

export default defineConfig({
  plugins: [
    paraglide({
      project: './project.inlang.json',
      outdir: './src/paraglide'
    })
  ]
})
```

### 2.3. Configurar Scripts

Adicione os scripts necessários no `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "paraglide-js compile --project ./project.inlang.json --outdir ./src/paraglide && vite build",
    "start": "vite preview"
  }
}
```

## 3. Criar Arquivos de Mensagens

Crie uma pasta `messages` na raiz do projeto e adicione os arquivos de tradução para cada idioma:

### messages/en.json
```json
{
  "$schema": "https://inlang.com/schema/inlang-message-format",
  "welcome": "Welcome {username}",
  "hello": "Hello",
  "buttons": {
    "submit": "Submit",
    "cancel": "Cancel"
  }
}
```

### messages/pt.json
```json
{
  "$schema": "https://inlang.com/schema/inlang-message-format",
  "welcome": "Bem-vindo {username}",
  "hello": "Olá",
  "buttons": {
    "submit": "Enviar",
    "cancel": "Cancelar"
  }
}
```

## 4. Usando as Mensagens no Código

### 4.1. Importar as Mensagens

```typescript
import * as m from "@/paraglide/messages";
```

### 4.2. Exemplo de Uso em um Componente React

```typescript
import * as m from "@/paraglide/messages";

function WelcomeComponent({ username }: { username: string }) {
  return (
    <div>
      <h1>{m.welcome({ username })}</h1>
      <p>{m.hello()}</p>
      <div>
        <button>{m.buttons.submit()}</button>
        <button>{m.buttons.cancel()}</button>
      </div>
    </div>
  );
}
```

## 5. Configuração do Idioma

### 5.1. Criar um Contexto de Idioma

```typescript
// src/contexts/language-context.tsx
import { createContext, useContext, useState } from 'react';
import { setLanguageTag } from '@/paraglide/runtime';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en');

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    setLanguageTag(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
```

### 5.2. Usar o Provider

```typescript
// src/App.tsx
import { LanguageProvider } from './contexts/language-context';

function App() {
  return (
    <LanguageProvider>
      {/* Seus componentes aqui */}
    </LanguageProvider>
  );
}
```

### 5.3. Exemplo de Troca de Idioma

```typescript
import { useLanguage } from '@/contexts/language-context';

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="pt">Português</option>
      <option value="es">Español</option>
      <option value="de">Deutsch</option>
    </select>
  );
}
```

## 6. Boas Práticas

1. **Organização de Mensagens**: Mantenha suas mensagens organizadas em categorias lógicas usando objetos aninhados.

2. **Validação**: Use o schema do Inlang para validar suas mensagens:
   ```json
   {
     "$schema": "https://inlang.com/schema/inlang-message-format"
   }
   ```

3. **Variáveis**: Use chaves para variáveis dinâmicas:
   ```json
   {
     "welcome": "Welcome {username} to {appName}"
   }
   ```

4. **Pluralização**: Para mensagens com pluralização, use o formato:
   ```json
   {
     "items": {
       "one": "{count} item",
       "other": "{count} items"
     }
   }
   ```

## 7. Dicas de Desenvolvimento

1. **Hot Reload**: O Paraglide suporta hot reload durante o desenvolvimento.

2. **Type Safety**: As mensagens são tipadas automaticamente, fornecendo autocompletar e verificação de tipos.

3. **Build**: Sempre execute o comando de build antes de fazer deploy para gerar os arquivos de mensagens atualizados.

4. **Git**: Adicione a pasta `paraglide` ao `.gitignore`:
   ```
   /src/paraglide
   /project.inlang
   ```

## 8. Solução de Problemas

1. **Mensagens não atualizando**: Execute o comando de build para regenerar os arquivos de mensagens.

2. **Erros de tipo**: Verifique se todas as mensagens estão definidas em todos os arquivos de idioma.

3. **Variáveis não funcionando**: Certifique-se de que as variáveis estão definidas corretamente no JSON e passadas corretamente na função.
