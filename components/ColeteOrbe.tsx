import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { Gyroscope } from 'expo-sensors';

const { width, height } = Dimensions.get('window');
const BASE_PLAYER_SIZE = 50;
const BASE_ORB_SIZE = 30;
const BASE_TIME_LIMIT = 30;
const ORBS_PER_LEVEL = 5;

// Componente da Tela de Início
const StartScreen = ({ onStart, isVisible }) => {
  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.startContainer}>
        <View style={styles.startContent}>
          <Text style={styles.title}>Colete os Orbes!</Text>
          <Text style={styles.subtitle}>Use o giroscópio do seu dispositivo para mover a bolinha e coletar os orbes azuis</Text>
          <Text style={styles.instructions}>
            • Cada nível fica mais difícil{"\n"}
            • A bolinha fica menor{"\n"}
            • Mais orbes para coletar{"\n"}
            • Fique atento ao tempo!{"\n"}
            • ⚠️ Nível 5+: Bolinhas roxas fazem você perder!{"\n"}
            • ⏱️ Nível 8+: Colete orbes dourados para ganhar tempo!{"\n"}
            • 🚫 Nível 8+: Encostar nas bordas perde 2 segundos!
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={onStart}>
            <Text style={styles.startButtonText}>Começar Jogo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Componente de Game Over
const GameOverScreen = ({ score, level, onRestart, isVisible }) => {
  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.gameOverContainer}>
        <View style={styles.gameOverContent}>
          <Text style={styles.gameOverTitle}>Fim de Jogo!</Text>
          <Text style={styles.gameOverText}>Nível alcançado: {level}</Text>
          <Text style={styles.gameOverText}>Pontuação: {score}</Text>
          <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
            <Text style={styles.restartButtonText}>Jogar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Componente de Comemoração de Nível
const LevelUpScreen = ({ level, onContinue, isVisible }) => {
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [isVisible]);

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.levelUpContainer}>
        <Animated.View style={[styles.levelUpContent, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.levelUpTitle}>🎉 Nível {level} 🎉</Text>
          <Text style={styles.levelUpText}>Parabéns!</Text>
          {level >= 5 && (
            <Text style={styles.levelUpWarning}>⚠️ Cuidado com as bolinhas roxas!</Text>
          )}
          {level >= 8 && (
            <>
              <Text style={styles.levelUpBonus}>⏱️ Agora tem orbes de tempo!</Text>
              <Text style={styles.levelUpWarning}>🚫 Encostar nas bordas perde 2 segundos!</Text>
            </>
          )}
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Função que gera a posição do orbe
const generateRandomPosition = (size) => {
  return {
    x: Math.random() * (width - size),
    y: Math.random() * (height - size),
  };
};

export default function App() {
  // Estados do jogo
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BASE_TIME_LIMIT);
  const [orbsCollected, setOrbsCollected] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [borderPenaltyCooldown, setBorderPenaltyCooldown] = useState(false);
  
  // Novos estados para as mecânicas especiais
  const [enemyOrbs, setEnemyOrbs] = useState([]);
  const [timeOrbs, setTimeOrbs] = useState([]);
  
  // Estados do sensor e posições
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [playerPosition, setPlayerPosition] = useState({ x: width / 2, y: height / 2 });
  const [orbPosition, setOrbPosition] = useState(generateRandomPosition(BASE_ORB_SIZE));

  // Calcular tamanhos baseado no nível
  const playerSize = Math.max(BASE_PLAYER_SIZE - (level * 2), 20);
  const orbSize = Math.max(BASE_ORB_SIZE - (level * 1.5), 15);
  const timeLimit = Math.max(BASE_TIME_LIMIT - (level * 2), 10);
  const orbsNeeded = ORBS_PER_LEVEL + level;

  // Efeito para inimigos (nível 5+)
  useEffect(() => {
    if (gameStarted && !gameOver && level >= 5) {
      const enemyInterval = setInterval(() => {
        if (enemyOrbs.length < Math.min(level - 3, 5)) {
          const newEnemy = {
            id: Date.now() + Math.random(),
            ...generateRandomPosition(20),
            size: 20,
          };
          setEnemyOrbs(prev => [...prev, newEnemy]);
        }
      }, 2000 - (level * 150));

      return () => clearInterval(enemyInterval);
    }
  }, [gameStarted, gameOver, level, enemyOrbs.length]);

  // Efeito para orbes de tempo (nível 8+)
  useEffect(() => {
    if (gameStarted && !gameOver && level >= 8) {
      const timeOrbInterval = setInterval(() => {
        if (timeOrbs.length < 2) {
          const newTimeOrb = {
            id: Date.now() + Math.random(),
            ...generateRandomPosition(25),
            size: 25,
          };
          setTimeOrbs(prev => [...prev, newTimeOrb]);
        }
      }, 5000);

      return () => clearInterval(timeOrbInterval);
    }
  }, [gameStarted, gameOver, level, timeOrbs.length]);

  // Efeito para movimento dos inimigos
  useEffect(() => {
    if (gameStarted && !gameOver && level >= 5) {
      const moveInterval = setInterval(() => {
        setEnemyOrbs(prev => 
          prev.map(enemy => ({
            ...enemy,
            y: enemy.y + 2 + (level * 0.5),
          })).filter(enemy => enemy.y < height)
        );
      }, 50);

      return () => clearInterval(moveInterval);
    }
  }, [gameStarted, gameOver, level]);

  // Efeito para movimento dos orbes de tempo
  useEffect(() => {
    if (gameStarted && !gameOver && level >= 8) {
      const moveInterval = setInterval(() => {
        setTimeOrbs(prev => 
          prev.map(orb => ({
            ...orb,
            y: orb.y + 1.5,
          })).filter(orb => orb.y < height)
        );
      }, 50);

      return () => clearInterval(moveInterval);
    }
  }, [gameStarted, gameOver, level]);

  // Cooldown para penalidade de borda
  useEffect(() => {
    if (borderPenaltyCooldown) {
      const cooldownTimer = setTimeout(() => {
        setBorderPenaltyCooldown(false);
      }, 1000); // 1 segundo de cooldown entre penalidades

      return () => clearTimeout(cooldownTimer);
    }
  }, [borderPenaltyCooldown]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      Gyroscope.setUpdateInterval(16);

      const subscription = Gyroscope.addListener(gyroscopeData => {
        setData(gyroscopeData);
      });

      return () => subscription.remove();
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      let newX = playerPosition.x - data.y * 10;
      let newY = playerPosition.y - data.x * 10;

      let hitBorder = false;

      // Verifica se encostou na borda esquerda
      if (newX <= 0) {
        newX = 0;
        hitBorder = true;
      }
      // Verifica se encostou na borda direita
      if (newX >= width - playerSize) {
        newX = width - playerSize;
        hitBorder = true;
      }
      // Verifica se encostou na borda superior
      if (newY <= 0) {
        newY = 0;
        hitBorder = true;
      }
      // Verifica se encostou na borda inferior
      if (newY >= height - playerSize) {
        newY = height - playerSize;
        hitBorder = true;
      }

      // Aplica penalidade de tempo se encostou na borda (nível 8+)
      if (hitBorder && level >= 8 && !borderPenaltyCooldown && !showLevelUp) {
        setTimeLeft(prev => Math.max(prev - 2, 0));
        setBorderPenaltyCooldown(true);
        
        // Feedback visual - piscar a tela ou borda
        // Você pode adicionar um efeito visual aqui se quiser
      }

      setPlayerPosition({ x: newX, y: newY });
    }
  }, [data, gameStarted, gameOver, playerSize, level, borderPenaltyCooldown, showLevelUp]);

  // Detecção de colisão com orbe normal
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const playerCenterX = playerPosition.x + playerSize / 2;
      const playerCenterY = playerPosition.y + playerSize / 2;
      const orbCenterX = orbPosition.x + orbSize / 2;
      const orbCenterY = orbPosition.y + orbSize / 2;

      const dx = playerCenterX - orbCenterX;
      const dy = playerCenterY - orbCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < (playerSize / 2) + (orbSize / 2)) {
        const newOrbsCollected = orbsCollected + 1;
        setOrbsCollected(newOrbsCollected);
        setScore(score + (10 * level));
        
        if (newOrbsCollected >= orbsNeeded) {
          const newLevel = level + 1;
          setLevel(newLevel);
          setOrbsCollected(0);
          setTimeLeft(timeLimit);
          setShowLevelUp(true);
          setEnemyOrbs([]);
          setTimeOrbs([]);
        }
        
        setOrbPosition(generateRandomPosition(orbSize));
      }
    }
  }, [playerPosition, gameStarted, gameOver]);

  // Detecção de colisão com inimigos (nível 5+)
  useEffect(() => {
    if (gameStarted && !gameOver && level >= 5) {
      const playerCenterX = playerPosition.x + playerSize / 2;
      const playerCenterY = playerPosition.y + playerSize / 2;

      enemyOrbs.forEach(enemy => {
        const enemyCenterX = enemy.x + enemy.size / 2;
        const enemyCenterY = enemy.y + enemy.size / 2;

        const dx = playerCenterX - enemyCenterX;
        const dy = playerCenterY - enemyCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (playerSize / 2) + (enemy.size / 2)) {
          setGameOver(true);
        }
      });
    }
  }, [playerPosition, enemyOrbs, gameStarted, gameOver, level, playerSize]);

  // Detecção de colisão com orbes de tempo (nível 8+)
  useEffect(() => {
    if (gameStarted && !gameOver && level >= 8) {
      const playerCenterX = playerPosition.x + playerSize / 2;
      const playerCenterY = playerPosition.y + playerSize / 2;

      timeOrbs.forEach((timeOrb, index) => {
        const timeOrbCenterX = timeOrb.x + timeOrb.size / 2;
        const timeOrbCenterY = timeOrb.y + timeOrb.size / 2;

        const dx = playerCenterX - timeOrbCenterX;
        const dy = playerCenterY - timeOrbCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (playerSize / 2) + (timeOrb.size / 2)) {
          setTimeLeft(prev => prev + 5);
          setScore(score + 20);
          setTimeOrbs(prev => prev.filter((_, i) => i !== index));
        }
      });
    }
  }, [playerPosition, timeOrbs, gameStarted, gameOver, level, playerSize]);

  // Timer do jogo
  useEffect(() => {
    let timer;
    if (gameStarted && !gameOver && timeLeft > 0 && !showLevelUp) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setGameOver(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameOver, timeLeft, showLevelUp]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setLevel(1);
    setScore(0);
    setTimeLeft(BASE_TIME_LIMIT);
    setOrbsCollected(0);
    setEnemyOrbs([]);
    setTimeOrbs([]);
    setBorderPenaltyCooldown(false);
    setPlayerPosition({ x: width / 2, y: height / 2 });
    setOrbPosition(generateRandomPosition(orbSize));
  };

  const restartGame = () => {
    startGame();
  };

  const continueToNextLevel = () => {
    setShowLevelUp(false);
  };

  return (
    <View style={styles.container}>
      <StartScreen onStart={startGame} isVisible={!gameStarted && !gameOver} />
      
      <GameOverScreen 
        score={score} 
        level={level} 
        onRestart={restartGame} 
        isVisible={gameOver} 
      />

      <LevelUpScreen 
        level={level} 
        onContinue={continueToNextLevel} 
        isVisible={showLevelUp} 
      />

      {gameStarted && !gameOver && !showLevelUp && (
        <>
          {/* Header com informações do jogo */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Nível: {level}</Text>
            <Text style={styles.headerText}>Tempo: {timeLeft}s</Text>
            <Text style={styles.headerText}>Orbes: {orbsCollected}/{orbsNeeded}</Text>
            <Text style={styles.headerText}>Pontos: {score}</Text>
          </View>

          {/* Feedback de penalidade de borda */}
          {level >= 8 && borderPenaltyCooldown && (
            <View style={styles.penaltyFeedback}>
              <Text style={styles.penaltyText}>-2s!</Text>
            </View>
          )}

          {/* Orbe normal (azul) */}
          <View
            style={[
              styles.orb,
              {
                width: orbSize,
                height: orbSize,
                borderRadius: orbSize / 2,
                left: orbPosition.x,
                top: orbPosition.y,
              },
            ]}
          />
          
          {/* Inimigos (roxos) - Nível 5+ */}
          {level >= 5 && enemyOrbs.map(enemy => (
            <View
              key={enemy.id}
              style={[
                styles.enemyOrb,
                {
                  width: enemy.size,
                  height: enemy.size,
                  borderRadius: enemy.size / 2,
                  left: enemy.x,
                  top: enemy.y,
                },
              ]}
            />
          ))}

          {/* Orbes de tempo (dourados) - Nível 8+ */}
          {level >= 8 && timeOrbs.map(timeOrb => (
            <View
              key={timeOrb.id}
              style={[
                styles.timeOrb,
                {
                  width: timeOrb.size,
                  height: timeOrb.size,
                  borderRadius: timeOrb.size / 2,
                  left: timeOrb.x,
                  top: timeOrb.y,
                },
              ]}
            />
          ))}
          
          {/* Player */}
          <View
            style={[
              styles.player,
              {
                width: playerSize,
                height: playerSize,
                borderRadius: playerSize / 2,
                left: playerPosition.x,
                top: playerPosition.y,
                borderColor: level >= 8 && borderPenaltyCooldown ? '#e74c3c' : '#fff',
              },
            ]}
          />

          {/* Barra de progresso dos orbes */}
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${(orbsCollected / orbsNeeded) * 100}%` }
              ]} 
            />
          </View>

          {/* Legenda dos elementos */}
          <View style={styles.legend}>
            {level >= 5 && (
              <Text style={styles.legendText}>💜 = Perde | </Text>
            )}
            {level >= 8 && (
              <Text style={styles.legendText}>⭐ = +5s | </Text>
            )}
            {level >= 8 && (
              <Text style={styles.legendText}>🚫 = -2s nas bordas</Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  // Estilos da tela de início
  startContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startContent: {
    backgroundColor: '#34495e',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    margin: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilos do game over
  gameOverContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverContent: {
    backgroundColor: '#34495e',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    margin: 20,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 20,
  },
  gameOverText: {
    fontSize: 18,
    color: '#ecf0f1',
    marginBottom: 10,
  },
  restartButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilos da tela de comemoração
  levelUpContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpContent: {
    backgroundColor: '#27ae60',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    margin: 20,
  },
  levelUpTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  levelUpText: {
    fontSize: 18,
    color: '#ecf0f1',
    marginBottom: 10,
  },
  levelUpWarning: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  levelUpBonus: {
    fontSize: 16,
    color: '#f1c40f',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilos do jogo
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  penaltyFeedback: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  penaltyText: {
    color: '#e74c3c',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  player: {
    position: 'absolute',
    backgroundColor: 'coral',
    borderWidth: 2,
  },
  orb: {
    position: 'absolute',
    backgroundColor: '#3498db',
    borderWidth: 2,
    borderColor: '#fff',
  },
  enemyOrb: {
    position: 'absolute',
    backgroundColor: '#9b59b6',
    borderWidth: 2,
    borderColor: '#fff',
  },
  timeOrb: {
    position: 'absolute',
    backgroundColor: '#f1c40f',
    borderWidth: 2,
    borderColor: '#fff',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 10,
    backgroundColor: '#34495e',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  legend: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legendText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
});