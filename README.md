# 🎮 Colete os Orbes

Um jogo mobile divertido e desafiador desenvolvido em React Native com Expo, onde você controla uma bolinha usando o giroscópio do dispositivo para coletar orbes e avançar de nível.

## 🎯 Sobre o Jogo

Colete os Orbes é um jogo de habilidade e estratégia onde você:
- Controla uma bolinha usando o movimento do dispositivo
- Coleta orbes azuis para avançar de nível
- Enfrenta desafios progressivos a cada fase
- Competa contra o tempo para obter a maior pontuação

## ✨ Características

### 🎮 Mecânicas de Jogo
- **Controle por Giroscópio**: Movimente a bolinha inclinando o dispositivo
- **Sistema de Níveis Progressivos**: Cada nível fica mais desafiador
- **Tempo Limitado**: Complete os objetivos antes do tempo acabar
- **Pontuação**: Ganhe pontos baseados no nível e coletas especiais

### 📈 Progressão de Dificuldade

#### 🌟 Níveis 1-4
- Coleta de orbes azuis básicos
- Bolinha e orbes diminuem de tamanho gradualmente
- Tempo limite reduzido a cada nível

#### ⚠️ Nível 5+
- **Bolinhas Roxas Inimigas**: Encostar = Game Over
- Inimigos caem mais rápido em níveis mais altos
- Quantidade de inimigos aumenta progressivamente

#### ⏱️ Nível 8+
- **Orbes Dourados de Tempo**: Colete para ganhar +5 segundos
- **Penalidade de Bordas**: Encostar nas bordas = -2 segundos
- Sistema de cooldown para evitar spam de penalidades

### 🎨 Interface
- Design limpo e intuitivo
- Feedback visual imediato para ações
- Tela de comemoração animada ao passar de nível
- Barra de progresso para acompanhar as coletas
- Legenda explicativa dos elementos do jogo

## 🚀 Como Jogar

1. **Início**: Toque em "Começar Jogo" na tela inicial
2. **Controles**: Incline o dispositivo para mover a bolinha
3. **Objetivo**: Colete todos os orbes azuis antes do tempo acabar
4. **Avanço**: Complete a cota de orbes para passar de nível
5. **Sobrevivência**: Evite bolinhas roxas e use estratégia nas bordas

### 🎯 Dicas Estratégicas
- **Níveis Iniciais**: Foque em aprender a sensibilidade dos controles
- **Níveis 5+**: Mantenha-se no centro para evitar inimigos
- **Níveis 8+**: Use as bordas com cuidado e priorize orbes de tempo
- **Geral**: Movimentos suaves são mais eficientes que movimentos bruscos

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **Expo Sensors** - Acesso ao giroscópio
- **TypeScript** - Tipagem estática
- **React Native Animated** - Animações suaves

## 📋 Pré-requisitos

- Node.js 14+
- Expo CLI
- Dispositivo mobile com giroscópio
- iOS ou Android

## 🔧 Instalação e Execução

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Entre no diretório
cd ColeteOrbe

# Instale as dependências
npm install

# Execute o projeto
expo start