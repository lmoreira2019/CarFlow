# 📱 Instalação como PWA - CarFlow

## O que é PWA?

PWA (Progressive Web App) é uma aplicação web que funciona como um app nativo, instalável na tela inicial do seu dispositivo.

## ✨ Benefícios de Instalar Como PWA

- ✅ **Dados persistem** mesmo após limpar cache do navegador
- ✅ **Funciona offline** (com Service Worker)
- ✅ **Sem limite de armazenamento** (até alguns MB)
- ✅ **App icon** na tela inicial (Android, iOS, Desktop)
- ✅ **Experiência native** - sem barra de endereço
- ✅ **Acesso rápido** via atalhos
- ✅ **Notificações** (futura implementação)

## 🚀 Como Instalar

### Android (Chrome, Edge, Firefox)

1. **Abra a página** do CarFlow no navegador
2. **Clique no menu** (⋮) no canto superior direito
3. Selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**
4. Confirme a instalação
5. O app aparecerá na sua tela inicial! 📱

**Alternativa:**
- Pressione e segure na barra de endereço
- Selecione **"Instalar aplicativo"**

### iPhone/iPad (Safari)

1. **Abra no Safari** (não funciona em outros navegadores)
2. Clique no botão **Compartilhar** (seta para cima)
3. Selecione **"Adicionar à Tela Inicial"**
4. Nomeie como "CarFlow"
5. Toque em **"Adicionar"**

### Windows/Mac (Chrome, Edge)

1. **Clique no ícone** de instalação (lado direito da barra de endereço)
2. Ou clique no menu (⋮) → **"Instalar CarFlow"**
3. Confirme a instalação
4. Abre como app desktop! 🖥️

## 💾 Persistência de Dados

### Como funciona:

1. **localStorage** - Armazena dados no app
2. **Service Worker** - Cache para funcionamento offline
3. **Instalação PWA** - Isolamento da origem (dados separados do navegador)

### O que acontece em cada cenário:

| Ação | Dados Preservados? |
|------|-------------------|
| Recarregar página | ✅ **SIM** |
| Fechar e reabrir app | ✅ **SIM** |
| Limpar cache do navegador | ✅ **SIM** (dados no app) |
| Desinstalar app | ❌ NÃO |
| Limpar dados do app (em Configurações) | ❌ NÃO |

### Por que os dados são seguros no PWA?

O PWA instala a aplicação com seu **próprio localStorage isolado**. Quando você limpa o cache do navegador, isso não afeta o localStorage do app PWA instalado.

## 🔄 Atualizações

O Service Worker atualiza automaticamente quando há novas versões. Você verá uma notificação (em futuras atualizações) oferecendo para fazer update.

## 📦 Compatibilidade

| Navegador | Android | iPhone | Desktop |
|-----------|---------|--------|---------|
| Chrome | ✅ | ⚠️ (apenas tela inicial) | ✅ |
| Edge | ✅ | ⚠️ (apenas tela inicial) | ✅ |
| Firefox | ✅ | ⚠️ (apenas tela inicial) | ✅ |
| Safari | ❌ | ✅ | ⚠️ |

## 🛠️ Resolução de Problemas

**Não vejo opção de instalar:**
- Certifique-se de que está no HTTPS ou localhost
- Atualize o navegador
- Aguarde alguns segundos na página
- Tente novamente

**Dados não estão sincronizando:**
- PWA mantém dados isolados (não sincroniza com navegador)
- Exporte dados JSON se quiser mover entre dispositivos
- Use a função de importação em outro dispositivo

**O app não funciona offline:**
- Primeiro acesso deve ser online (para cachear arquivos)
- Depois funciona offline
- Verifique se o Service Worker está registrado (devtools)

## 💡 Dicas

1. **Backup regular**: Use a função Exportar JSON mensalmente
2. **Múltiplos dispositivos**: Exporte em um, importe em outro
3. **Sincronizar**: Até agora não há sincronização em nuvem (by design)

---

**CarFlow v2.0** - Agora com suporte completo a PWA! 🚗
