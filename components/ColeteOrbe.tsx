import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Modal, Animated, Image } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import InfiniteScrollBackground from './InfiniteScrollBackground';

const { width, height } = Dimensions.get('window');
const BASE_PLAYER_SIZE = 80; 
const BASE_ORB_SIZE = 60;
const BASE_TIME_LIMIT = 40;
const ORBS_PER_LEVEL = 3;

// importe das imagens 
const images = {
  orbe: require('@/assets/orbe.png'),
  nave: require('@/assets/nave.png'),
  meteoro: require('@/assets/meteoro.png'),
  star: require('@/assets/star.png'),
  background: require('@/assets/galaxy-bg.png'),
};

// componente de Seleção de Modo e Nível
const GameModeScreen = ({ onStart, isVisible }) => {
  const [selectedMode, setSelectedMode] = useState('infinite');
  const [selectedLevel, setSelectedLevel] = useState(1);

  const levels = [1, 5, 10];
  
  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.modeContainer}>
        <View style={styles.modeContent}>
          <Text style={styles.title}>🌌 Missão Galáctica</Text>
          <Text style={styles.subtitle}>Navegue pelo cosmos e colete energia estelar!</Text>
          
          {/* Seleção de Modo */}
          <Text style={styles.sectionTitle}>Modo de Missão:</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity 
              style={[
                styles.modeButton, 
                selectedMode === 'infinite' && styles.modeButtonSelected
              ]}
              onPress={() => setSelectedMode('infinite')}
            >
              <Text style={[
                styles.modeButtonText,
                selectedMode === 'infinite' && styles.modeButtonTextSelected
              ]}>🚀 Missão Infinita</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.modeButton, 
                selectedMode === 'level' && styles.modeButtonSelected
              ]}
              onPress={() => setSelectedMode('level')}
            >
              <Text style={[
                styles.modeButtonText,
                selectedMode === 'level' && styles.modeButtonTextSelected
              ]}>🪐 Missão Específica</Text>
            </TouchableOpacity>
          </View>

          {/* Seleção de Nível */}
          {selectedMode === 'level' && (
            <>
              <Text style={styles.sectionTitle}>Setor Galáctico:</Text>
              <View style={styles.levelButtons}>
                {levels.map(level => (
                  <TouchableOpacity 
                    key={level}
                    style={[
                      styles.levelButton,
                      selectedLevel === level && styles.levelButtonSelected
                    ]}
                    onPress={() => setSelectedLevel(level)}
                  >
                    <Text style={[
                      styles.levelButtonText,
                      selectedLevel === level && styles.levelButtonTextSelected
                    ]}>Setor {level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Informações do modo selecionado */}
          <View style={styles.modeInfo}>
            {selectedMode === 'infinite' ? (
              <Text style={styles.modeInfoText}>
                • Explore o cosmos infinitamente{"\n"}
                • Dificuldade aumenta progressivamente{"\n"}
                • Alcance a maior pontuação cósmica!
              </Text>
            ) : (
              <Text style={styles.modeInfoText}>
                • Inicie no Setor {selectedLevel}{"\n"}
                • Enfrente desafios específicos{"\n"}
                • Perfeito para treinamento estelar!
              </Text>
            )}
          </View>

          <View style={styles.legendIcons}>
            <View style={styles.legendItem}>
              <Image source={images.orbe} style={styles.legendIcon} />
              <Text style={styles.legendText}>= Energia (+10 pts)</Text>
            </View>
            <View style={styles.legendItem}>
              <Image source={images.meteoro} style={styles.legendIcon} />
              <Text style={styles.legendText}>= Meteoro (Perde)</Text>
            </View>
            <View style={styles.legendItem}>
              <Image source={images.star} style={styles.legendIcon} />
              <Text style={styles.legendText}>= Estrela (+5s)</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.startButton} 
            onPress={() => onStart(selectedMode, selectedLevel)}
          >
            <Text style={styles.startButtonText}>
              {selectedMode === 'infinite' ? '🚀 Iniciar Missão' : `🪐 Iniciar Setor ${selectedLevel}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Componente de Game Over (atualizado)
const GameOverScreen = ({ score, level, onRestart, onMenu, isVisible, gameMode }) => {
  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.gameOverContainer}>
        <View style={styles.gameOverContent}>
          <Text style={styles.gameOverTitle}>🌠 Missão Concluída!</Text>
          <Text style={styles.gameOverText}>Setor Alcançado: {level}</Text>
          <Text style={styles.gameOverText}>Energia Coletada: {score}</Text>
          <Text style={styles.gameOverSubtext}>
            {gameMode === 'infinite' ? 'Missão Infinita' : `Setor ${level}`}
          </Text>
          
          <View style={styles.gameOverButtons}>
            <TouchableOpacity style={[styles.restartButton, styles.menuButton]} onPress={onRestart}>
              <Text style={styles.restartButtonText}>🔄 Nova Missão</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.restartButton, styles.menuButton]} onPress={onMenu}>
              <Text style={styles.restartButtonText}>🏠 Menu Principal</Text>
            </TouchableOpacity>
          </View>
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
          <Text style={styles.levelUpTitle}>🎉 Setor {level} 🎉</Text>
          <Text style={styles.levelUpText}>Missão Cumprida!</Text>
          {level >= 5 && (
            <Text style={styles.levelUpWarning}>⚠️ Cuidado com os meteoros!</Text>
          )}
          {level >= 8 && (
            <>
              <Text style={styles.levelUpBonus}>⏱️ Agora tem estrelas de tempo!</Text>
              <Text style={styles.levelUpWarning}>🚫 Campos de asteróides perdem 2s!</Text>
            </>
          )}
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>Continuar Exploração</Text>
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
  const [gameState, setGameState] = useState('menu');
  const [gameMode, setGameMode] = useState('infinite');
  const [initialLevel, setInitialLevel] = useState(1);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BASE_TIME_LIMIT);
  const [orbsCollected, setOrbsCollected] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [borderPenaltyCooldown, setBorderPenaltyCooldown] = useState(false);
  
  // Estados para os elementos especiais
  const [enemyOrbs, setEnemyOrbs] = useState([]);
  const [timeOrbs, setTimeOrbs] = useState([]);
  
  // Estados do sensor e posições
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [playerPosition, setPlayerPosition] = useState({ x: width / 2, y: height / 2 });
  const [orbPosition, setOrbPosition] = useState(generateRandomPosition(BASE_ORB_SIZE));

  // Calcular tamanhos baseado no nível
  const playerSize = Math.max(BASE_PLAYER_SIZE - (level * 2), 40);
  const orbSize = Math.max(BASE_ORB_SIZE - (level * 1.5), 25);
  const timeLimit = Math.max(BASE_TIME_LIMIT - (level * 2), 10);
  const orbsNeeded = ORBS_PER_LEVEL + level;

  // Efeitos para geração de elementos (mantidos iguais)
  useEffect(() => {
    if (gameState === 'playing' && level >= 5) {
      const enemyInterval = setInterval(() => {
        if (enemyOrbs.length < Math.min(level - 3, 5)) {
          const newEnemy = {
            id: Date.now() + Math.random(),
            ...generateRandomPosition(35),
            size: 35,
          };
          setEnemyOrbs(prev => [...prev, newEnemy]);
        }
      }, 2000 - (level * 150));

      return () => clearInterval(enemyInterval);
    }
  }, [gameState, level, enemyOrbs.length]);

  useEffect(() => {
    if (gameState === 'playing' && level >= 8) {
      const timeOrbInterval = setInterval(() => {
        if (timeOrbs.length < 2) {
          const newTimeOrb = {
            id: Date.now() + Math.random(),
            ...generateRandomPosition(30),
            size: 30,
          };
          setTimeOrbs(prev => [...prev, newTimeOrb]);
        }
      }, 5000);

      return () => clearInterval(timeOrbInterval);
    }
  }, [gameState, level, timeOrbs.length]);

  // Efeitos para movimento (mantidos iguais)
  useEffect(() => {
    if (gameState === 'playing' && level >= 5) {
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
  }, [gameState, level]);

  useEffect(() => {
    if (gameState === 'playing' && level >= 8) {
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
  }, [gameState, level]);

  // Resto dos efeitos (mantidos iguais)
  useEffect(() => {
    if (borderPenaltyCooldown) {
      const cooldownTimer = setTimeout(() => {
        setBorderPenaltyCooldown(false);
      }, 1000);
      return () => clearTimeout(cooldownTimer);
    }
  }, [borderPenaltyCooldown]);

  useEffect(() => {
    if (gameState === 'playing') {
      Gyroscope.setUpdateInterval(16);
      const subscription = Gyroscope.addListener(gyroscopeData => {
        setData(gyroscopeData);
      });
      return () => subscription.remove();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      let newX = playerPosition.x - data.y * 10;
      let newY = playerPosition.y - data.x * 10;

      let hitBorder = false;

      if (newX <= 0) {
        newX = 0;
        hitBorder = true;
      }
      if (newX >= width - playerSize) {
        newX = width - playerSize;
        hitBorder = true;
      }
      if (newY <= 0) {
        newY = 0;
        hitBorder = true;
      }
      if (newY >= height - playerSize) {
        newY = height - playerSize;
        hitBorder = true;
      }

      if (hitBorder && level >= 8 && !borderPenaltyCooldown && !showLevelUp) {
        setTimeLeft(prev => Math.max(prev - 2, 0));
        setBorderPenaltyCooldown(true);
      }

      setPlayerPosition({ x: newX, y: newY });
    }
  }, [data, gameState, playerSize, level, borderPenaltyCooldown, showLevelUp]);

  // Detecção de colisões (mantidas iguais)
  useEffect(() => {
    if (gameState === 'playing') {
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
  }, [playerPosition, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && level >= 5) {
      const playerCenterX = playerPosition.x + playerSize / 2;
      const playerCenterY = playerPosition.y + playerSize / 2;

      enemyOrbs.forEach(enemy => {
        const enemyCenterX = enemy.x + enemy.size / 2;
        const enemyCenterY = enemy.y + enemy.size / 2;

        const dx = playerCenterX - enemyCenterX;
        const dy = playerCenterY - enemyCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (playerSize / 2) + (enemy.size / 2)) {
          setGameState('gameOver');
        }
      });
    }
  }, [playerPosition, enemyOrbs, gameState, level, playerSize]);

  useEffect(() => {
    if (gameState === 'playing' && level >= 8) {
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
  }, [playerPosition, timeOrbs, gameState, level, playerSize]);

  // Timer do jogo
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0 && !showLevelUp) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setGameState('gameOver');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState, timeLeft, showLevelUp]);

  const startGame = (mode, startLevel = 1) => {
    setGameMode(mode);
    setInitialLevel(startLevel);
    setLevel(startLevel);
    setGameState('playing');
    setScore(0);
    setTimeLeft(BASE_TIME_LIMIT - ((startLevel - 1) * 2));
    setOrbsCollected(0);
    setEnemyOrbs([]);
    setTimeOrbs([]);
    setBorderPenaltyCooldown(false);
    setPlayerPosition({ x: width / 2, y: height / 2 });
    setOrbPosition(generateRandomPosition(orbSize));
  };

  const restartGame = () => {
    startGame(gameMode, initialLevel);
  };

  const returnToMenu = () => {
    setGameState('menu');
  };

  const continueToNextLevel = () => {
    setShowLevelUp(false);
  };

  return (
    <View style={styles.container}>
      <InfiniteScrollBackground />
      <GameModeScreen 
        onStart={startGame} 
        isVisible={gameState === 'menu'} 
      />
      
      <GameOverScreen 
        score={score} 
        level={level} 
        onRestart={restartGame}
        onMenu={returnToMenu}
        isVisible={gameState === 'gameOver'} 
        gameMode={gameMode}
      />

      <LevelUpScreen 
        level={level} 
        onContinue={continueToNextLevel} 
        isVisible={showLevelUp} 
      />

      {gameState === 'playing' && !showLevelUp && (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>🪐 Setor: {level}</Text>
            <Text style={styles.headerText}>⏱️ {timeLeft}s</Text>
            <Text style={styles.headerText}>⚡ {orbsCollected}/{orbsNeeded}</Text>
            <Text style={styles.headerText}>🌟 {score}</Text>
            <Text style={styles.headerText}>
              {gameMode === 'infinite' ? '🚀 Infinito' : `🪐 Setor ${initialLevel}`}
            </Text>
          </View>

          {level >= 8 && borderPenaltyCooldown && (
            <View style={styles.penaltyFeedback}>
              <Text style={styles.penaltyText}>⚡ Campo de Asteróides! -2s</Text>
            </View>
          )}

          {/* Orbe de energia (azul) */}
          <Image
            source={images.orbe}
            style={[
              styles.orbImage,
              {
                width: orbSize,
                height: orbSize,
                left: orbPosition.x,
                top: orbPosition.y,
              },
            ]}
            resizeMode="contain"
          />
          
          {/* Meteoros (inimigos) - Nível 5+ */}
          {level >= 5 && enemyOrbs.map(enemy => (
            <Image
              key={enemy.id}
              source={images.meteoro}
              style={[
                styles.orbImage,
                {
                  width: enemy.size,
                  height: enemy.size,
                  left: enemy.x,
                  top: enemy.y,
                },
              ]}
              resizeMode="contain"
            />
          ))}

          {/* Estrelas de tempo - Nível 8+ */}
          {level >= 8 && timeOrbs.map(timeOrb => (
            <Image
              key={timeOrb.id}
              source={images.star}
              style={[
                styles.orbImage,
                {
                  width: timeOrb.size,
                  height: timeOrb.size,
                  left: timeOrb.x,
                  top: timeOrb.y,
                },
              ]}
              resizeMode="contain"
            />
          ))}
          
          {/* Nave do jogador */}
          <Image
            source={images.nave}
            style={[
              styles.playerImage,
              {
                width: playerSize,
                height: playerSize,
                left: playerPosition.x,
                top: playerPosition.y,
                transform: [
                  { rotate: `${data.x * 10}deg` }
                ],
              },
            ]}
            resizeMode="contain"
          />

          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${(orbsCollected / orbsNeeded) * 100}%` }
              ]} 
            />
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItemSmall}>
              <Image source={images.orbe} style={styles.legendIconSmall} />
              <Text style={styles.legendTextSmall}>= Energia</Text>
            </View>
            {level >= 5 && (
              <View style={styles.legendItemSmall}>
                <Image source={images.meteoro} style={styles.legendIconSmall} />
                <Text style={styles.legendTextSmall}>= Meteoro</Text>
              </View>
            )}
            {level >= 8 && (
              <View style={styles.legendItemSmall}>
                <Image source={images.star} style={styles.legendIconSmall} />
                <Text style={styles.legendTextSmall}>= +5s</Text>
              </View>
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
    backgroundColor: 'transparent',
  },
  // Estilos da tela de seleção de modo
  modeContainer: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeContent: {
    backgroundColor: 'rgba(25, 25, 65, 0.9)',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    margin: 20,
    minWidth: '80%',
    borderWidth: 2,
    borderColor: '#4a4a8a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8be9fd',
    marginTop: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#1e1e4a',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a4a8a',
  },
  modeButtonSelected: {
    backgroundColor: '#6272a4',
    borderColor: '#bd93f9',
  },
  modeButtonText: {
    color: '#bd93f9',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modeButtonTextSelected: {
    color: '#f8f8f2',
  },
  levelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  levelButton: {
    flex: 1,
    backgroundColor: '#1e1e4a',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a4a8a',
  },
  levelButtonSelected: {
    backgroundColor: '#ffb86c',
    borderColor: '#ff79c6',
  },
  levelButtonText: {
    color: '#50fa7b',
    fontWeight: 'bold',
  },
  levelButtonTextSelected: {
    color: '#1e1e4a',
  },
  modeInfo: {
    backgroundColor: 'rgba(30, 30, 74, 0.8)',
    padding: 15,
    borderRadius: 12,
    marginVertical: 15,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#50fa7b',
  },
  modeInfoText: {
    color: '#f8f8f2',
    fontSize: 14,
    lineHeight: 20,
  },
  legendIcons: {
    width: '100%',
    marginVertical: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    padding: 8,
    backgroundColor: 'rgba(30, 30, 74, 0.6)',
    borderRadius: 8,
  },
  legendIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  legendText: {
    color: '#f8f8f2',
    fontSize: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8be9fd',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#bd93f9',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#6272a4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#bd93f9',
  },
  startButtonText: {
    color: '#f8f8f2',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameOverContainer: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverContent: {
    backgroundColor: 'rgba(25, 25, 65, 0.9)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    margin: 20,
    borderWidth: 2,
    borderColor: '#4a4a8a',
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff79c6',
    marginBottom: 20,
  },
  gameOverText: {
    fontSize: 18,
    color: '#8be9fd',
    marginBottom: 10,
  },
  gameOverSubtext: {
    fontSize: 16,
    color: '#bd93f9',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  gameOverButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  restartButton: {
    flex: 1,
    backgroundColor: '#6272a4',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bd93f9',
  },
  menuButton: {
    backgroundColor: '#ffb86c',
    borderColor: '#ff79c6',
  },
  restartButtonText: {
    color: '#f8f8f2',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  levelUpContainer: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpContent: {
    backgroundColor: 'rgba(86, 61, 124, 0.9)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    margin: 20,
    borderWidth: 2,
    borderColor: '#bd93f9',
  },
  levelUpTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8f8f2',
    marginBottom: 10,
  },
  levelUpText: {
    fontSize: 18,
    color: '#8be9fd',
    marginBottom: 10,
  },
  levelUpWarning: {
    fontSize: 16,
    color: '#ff5555',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  levelUpBonus: {
    fontSize: 16,
    color: '#f1fa8c',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#50fa7b',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  continueButtonText: {
    color: '#1e1e4a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    flexWrap: 'wrap',
    backgroundColor: 'rgba(30, 30, 74, 0.8)',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#4a4a8a',
  },
  headerText: {
    color: '#8be9fd',
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 2,
    marginVertical: 2,
  },
  penaltyFeedback: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  penaltyText: {
    color: '#ff5555',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(30, 30, 74, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff5555',
  },

  playerImage: {
    position: 'absolute',
  },
  orbImage: {
    position: 'absolute',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 12,
    backgroundColor: 'rgba(30, 30, 74, 0.8)',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4a4a8a',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#50fa7b',
    borderRadius: 6,
  },
  legend: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  legendItemSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 2,
    padding: 5,
    backgroundColor: 'rgba(30, 30, 74, 0.7)',
    borderRadius: 6,
  },
  legendIconSmall: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  legendTextSmall: {
    color: '#f8f8f2',
    fontSize: 10,
    fontWeight: 'bold',
  },
});