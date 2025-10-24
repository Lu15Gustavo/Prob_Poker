# 🎲 Calculadora de Probabilidades de Poker com React

Interface interativa para calcular probabilidades de vitória em partidas de poker usando o algoritmo Monte Carlo.

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
cd poker-react
npm install
```

### 2. Iniciar o Aplicativo

```bash
npm start
```

O aplicativo abrirá automaticamente em `http://localhost:3000`

## 🎮 Como Usar

### Adicionar Jogadores
1. Clique no botão "+ Adicionar Jogador" em qualquer uma das 3 posições
2. Selecione 2 cartas para cada jogador no modal que aparece

### Adicionar Cartas Comunitárias
1. Clique nos slots com "?" no centro da mesa
2. Selecione até 5 cartas (Flop, Turn, River)

### Ver Probabilidades
- As probabilidades são calculadas automaticamente
- Aparecem embaixo de cada jogador quando ele tem 2 cartas
- Requer pelo menos 2 jogadores ativos para calcular

### Remover Cartas/Jogadores
- Passe o mouse sobre uma carta para ver o botão ×
- Clique no × vermelho no canto do jogador para removê-lo
- Use o botão "🔄 Resetar Mesa" para limpar tudo

## ✨ Recursos

- ✅ Até 3 jogadores simultâneos
- ✅ Seleção visual de cartas (52 cartas do baralho)
- ✅ Cartas já usadas ficam desabilitadas
- ✅ Cálculo em tempo real com 50.000 simulações
- ✅ Interface responsiva (funciona em mobile)
- ✅ Design realista de mesa de poker
- ✅ Animações suaves e feedback visual

## 🎨 Tecnologias

- **React 18** - Framework UI
- **JavaScript ES6+** - Lógica
- **CSS3** - Estilização com gradientes e animações
- **Algoritmo Monte Carlo** - Cálculo de probabilidades

## 📊 Precisão

O algoritmo executa 50.000 simulações para cada cálculo, garantindo precisão de ~99% nas probabilidades.

## 🎯 Exemplo de Uso

1. Adicione Jogador 1 com A♥ A♦
2. Adicione Jogador 2 com K♣ K♠
3. Veja que Jogador 1 tem ~81% de chance de vitória
4. Adicione cartas comunitárias: K♦ 4♦ 4♣
5. Veja a probabilidade inverter para Jogador 2 (Full House!)

## 📝 Notas

- Funciona melhor em navegadores modernos (Chrome, Firefox, Edge, Safari)
- Cálculos podem levar 1-2 segundos em dispositivos mais lentos
- Quanto mais cartas comunitárias, mais preciso o cálculo

---

Desenvolvido usando algoritmo Monte Carlo
