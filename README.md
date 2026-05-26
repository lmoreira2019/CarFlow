# CarFlow - Rastreador de Combustível e Manutenção

Uma aplicação web moderna e responsiva para rastrear consumo de combustível e manutenção do seu veículo.

## Funcionalidades

✨ **Rastreamento de Combustível**
- Registre abastecimentos com odômetro e quantidade de litros
- Cálculo automático de eficiência (km/L) com base no abastecimento anterior
- Métricas em tempo real: total de registros, eficiência atual e média
- Histórico completo de abastecimentos com timestamps
- Informe o preço por litro para tracking de custos

🔧 **Gerenciamento de Manutenção**
- Rastreie 4 itens essenciais de manutenção:
  - Óleo do Motor & Filtro
  - Filtro de Ar do Motor
  - Filtro de Combustível
  - Filtro de Ar Condicionado
- Badges visuais de status: Verde (OK), Amarelo (Em Breve), Vermelho (Vencida)
- Defina metas customizadas de quilometragem para cada item
- Alertas automáticos quando a manutenção está próxima (< 1.000 KM restantes)

💾 **Persistência de Dados**
- Todos os dados armazenados localmente no localStorage do navegador
- Exporte dados como JSON para backup
- Opção de limpar dados com confirmação

📱 **Experiência do Usuário**
- Design totalmente responsivo (mobile-first)
- Tema dark mode premium (inspirado em GitHub Dark)
- Inputs otimizados para mobile (fonte 16px para evitar auto-zoom)
- Tipografia limpa e navegação intuitiva
- Carregamento rápido e interações suaves

## Estrutura do Projeto

```
etios/
├── index.html          # Markup HTML principal
├── style.css           # Estilos dark mode e design responsivo
├── app.js              # Lógica da aplicação e gerenciamento de estado
└── README.md           # Este arquivo
```

## Instalação

### Desenvolvimento Local

1. Clone ou baixe este repositório
2. Abra `index.html` em seu navegador
3. Nenhum servidor ou dependências necessários!

### Deploy no GitHub Pages

#### Opção 1: Criar um novo repositório

1. Crie um novo repositório no GitHub chamado `carflow`
2. Clone localmente
3. Copie todos os arquivos (`index.html`, `style.css`, `app.js`, `README.md`) no repositório
4. Commit e push:
   ```bash
   git add .
   git commit -m "Commit inicial: Aplicação CarFlow"
   git push origin main
   ```
5. Vá em Settings → Pages
6. Em "Build and deployment", configure:
   - Source: `Deploy from a branch`
   - Branch: `main` / `/(root)`
7. Clique em Save

Seu site estará disponível em: `https://seu-usuario.github.io/carflow`

#### Opção 2: Repositório User Pages

Se você quer o site em `https://seu-usuario.github.io`:

1. Crie um repositório chamado `seu-usuario.github.io`
2. Adicione todos os arquivos neste repositório
3. Faça push para GitHub
4. Seu site estará em `https://seu-usuario.github.io`

## Uso

### Registrando Abastecimentos

1. Navegue até a seção **⛽ Rastreamento de Combustível**
2. Informe o odômetro atual (KM)
3. Informe quantos litros você abasteceu
4. Informe o preço por litro que você pagou
5. Clique em "Registrar Abastecimento"

**Cálculo de Eficiência:**
- A eficiência é calculada usando a quantidade de litros do abastecimento **anterior**
- Fórmula: `(Odômetro Atual - Odômetro Anterior) / Litros Anteriores`
- O primeiro registro não terá dados de eficiência (não há registro anterior)

### Gerenciando Manutenção

1. Navegue até a seção **🔧 Rastreamento de Manutenção**
2. Veja o status atual de todos os itens com badges visuais:
   - 🟢 **Verde (OK)**: Mais de 1.000 KM até a manutenção
   - 🟡 **Amarelo (Em Breve)**: Menos de 1.000 KM restantes
   - 🔴 **Vermelho (Vencida)**: Manutenção está vencida
3. Atualize os valores de KM alvo no formulário
4. Clique em "Atualizar Metas" para salvar

### Gerenciamento de Dados

- **Exportar Dados**: Clique em "📥 Exportar Dados (JSON)" para baixar um backup
- **Limpar Todos os Dados**: Clique em "🗑️ Limpar Todos os Dados" para resetar (com confirmação)

## Paleta de Cores

| Elemento | Cor | Hex |
|----------|-----|-----|
| Fundo | Slate Gray | `#0d1117` |
| Cards | Dark Slate | `#161b22` |
| Texto Primário | Light Gray | `#c9d1d9` |
| Texto Secundário | Medium Gray | `#8b949e` |
| Destaque Azul | Bright Blue | `#58a6ff` |
| Sucesso Verde | Verde | `#2ea44f` |
| Aviso Amarelo | Âmbar | `#d29922` |
| Perigo Vermelho | Vermelho | `#f85149` |

## Compatibilidade de Navegadores

- Chrome/Edge (última versão)
- Firefox (última versão)
- Safari (última versão)
- Navegadores mobile (iOS Safari, Chrome Mobile)

Requer suporte a localStorage (todos os navegadores modernos).

## Detalhes Técnicos

### Arquitetura

- **HTML**: Markup semântico com inputs acessíveis
- **CSS**: Design mobile-first responsivo com variáveis CSS para temas
- **JavaScript**: Vanilla JS (sem dependências) com funções modulares

### Armazenamento

Os dados são armazenados no `localStorage` do navegador com as seguintes chaves:
- `etiosflow_fuel_logs`: Array de registros de combustível
- `etiosflow_maintenance_targets`: Objeto com KM alvo para cada item
- `etiosflow_maintenance_history`: Array de registros de manutenção

### Cálculos Principais

**Eficiência de Combustível (km/L)**
```javascript
eficiência = (odômetro_atual - odômetro_anterior) / litros_anteriores
```

**Status de Manutenção**
```
KM Restantes = KM Alvo - Odômetro Atual
- KM Restantes < 0: VENCIDA (Vermelho)
- 0 ≤ KM Restantes < 1.000: EM BREVE (Amarelo)
- KM Restantes ≥ 1.000: OK (Verde)
```

## Customização

### Modificar Itens de Manutenção

Edite o objeto `MAINTENANCE_ITEMS` em `app.js` para adicionar/remover itens:
```javascript
const MAINTENANCE_ITEMS = {
    novo_item: { name: 'Novo Item', id: 'novo_item' },
    // ...
};
```

### Ajustar Variáveis CSS

Edite as variáveis CSS em `style.css`:
```css
:root {
    --bg-primary: #0d1117;      /* Cor de fundo primária */
    --accent-blue: #58a6ff;     /* Cor de destaque */
    --spacing-sm: 1rem;         /* Espaçamento base */
}
```

## Dicas

💡 **Melhores Práticas**
- Registre combustível consistentemente
- Defina metas de manutenção realistas baseado no manual do seu carro
- Exporte dados periodicamente como backup
- Verifique os badges de manutenção antes de cada viagem

## Melhorias Futuras

Possíveis adições:
- Gráficos de tendência de eficiência
- Cálculo de custo médio por km
- Rastreamento de custos de manutenção
- Sincronização entre dispositivos
- Toggle entre temas claro/escuro
- Suporte para múltiplos veículos

## Licença

Livre para usar e modificar para uso pessoal.

## Suporte

Para problemas ou sugestões:
1. Verifique o console (F12) para erros
2. Confirme que localStorage está habilitado no seu navegador
3. Limpe o cache do navegador se houver problemas
4. Exporte seus dados antes de limpar

---

**CarFlow v1.0** • Rastreador de Combustível e Manutenção 🚗
