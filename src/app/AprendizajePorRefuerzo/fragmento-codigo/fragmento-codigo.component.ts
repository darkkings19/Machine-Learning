import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PyodideService } from '../../services/pyodide.service';
import { MonacoEditorService } from '../../services/monaco-editor.service';

interface ExampleInfo {
  title: string;
  description: string;
  code: string;
  difficulty: 'básico' | 'intermedio' | 'avanzado';
  concepts: string[];
}

@Component({
  selector: 'app-fragmento-codigo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fragmento-codigo.component.html',
  styleUrl: './fragmento-codigo.component.css'
})
export class FragmentoCodigoComponent implements OnInit, OnDestroy {
  isLoading = false;
  error: string | null = null;
  output: string = '';
  selectedExample: string = 'basic';
  isRunning = false;
  
  examples: Record<string, ExampleInfo> = {
    basic: {
      title: 'Q-Learning Básico',
      description: 'Implementación básica de Q-learning con un entorno simple de 4 estados',
      difficulty: 'básico',
      concepts: ['Q-table', 'Política ε-greedy', 'Actualización Q-learning'],
      code: `import numpy as np
import random

# Parámetros del entorno
n_states = 4  # 4 estados (0, 1, 2, 3)
actions = [0, 1]  # 0 = izquierda, 1 = derecha
rewards = [0, 0, 0, 1]  # recompensa solo al llegar al estado 3

# Matriz Q inicial
Q = np.zeros((n_states, len(actions)))

# Parámetros de aprendizaje
alpha = 0.1     # tasa de aprendizaje
gamma = 0.9     # factor de descuento
epsilon = 0.2   # exploración

# Función para elegir acción con ε-greedy
def choose_action(state):
    if random.uniform(0, 1) < epsilon:
        return random.choice(actions)
    else:
        return np.argmax(Q[state])

# Simulación de episodios
for episode in range(100):
    state = 0  # iniciar siempre desde el estado 0

    while state != 3:  # hasta llegar al estado terminal
        action = choose_action(state)

        # Transición de estado
        next_state = state + 1 if action == 1 else max(0, state - 1)

        # Actualización Q-learning
        Q[state, action] = Q[state, action] + alpha * (
            rewards[next_state] + gamma * np.max(Q[next_state]) - Q[state, action]
        )

        state = next_state

# Mostrar la matriz Q aprendida
print("Q-table aprendida:")
print(Q)
print("\\nPolítica óptima:")
for state in range(n_states):
    best_action = np.argmax(Q[state])
    direction = "derecha" if best_action == 1 else "izquierda"
    print(f"Estado {state}: ir {direction} (Q-value: {Q[state, best_action]:.3f})")
`
    },
    
    environment: {
      title: 'Entorno GridWorld',
      description: 'Q-learning en un entorno de grid 2D con obstáculos',
      difficulty: 'intermedio',
      concepts: ['GridWorld', 'Estados 2D', 'Obstáculos', 'Recompensas múltiples'],
      code: `import numpy as np
import random

# Definir el GridWorld (5x5)
grid_size = 5
start_pos = (0, 0)
goal_pos = (4, 4)
obstacles = [(1, 1), (2, 2), (3, 1)]

# Acciones: 0=arriba, 1=derecha, 2=abajo, 3=izquierda
actions = [0, 1, 2, 3]
action_names = ['arriba', 'derecha', 'abajo', 'izquierda']

# Inicializar Q-table
Q = np.zeros((grid_size, grid_size, len(actions)))

# Parámetros
alpha = 0.1
gamma = 0.9
epsilon = 0.3

def get_next_state(state, action):
    x, y = state
    if action == 0:  # arriba
        x = max(0, x - 1)
    elif action == 1:  # derecha
        y = min(grid_size - 1, y + 1)
    elif action == 2:  # abajo
        x = min(grid_size - 1, x + 1)
    elif action == 3:  # izquierda
        y = max(0, y - 1)
    
    # Verificar si es un obstáculo
    if (x, y) in obstacles:
        return state  # mantener posición actual
    
    return (x, y)

def get_reward(state):
    if state == goal_pos:
        return 10  # recompensa por llegar al objetivo
    elif state in obstacles:
        return -5  # penalización por obstáculo
    else:
        return -0.1  # pequeña penalización por cada paso

def choose_action(state):
    if random.uniform(0, 1) < epsilon:
        return random.choice(actions)
    else:
        x, y = state
        return np.argmax(Q[x, y])

# Entrenamiento
episodes = 500
for episode in range(episodes):
    state = start_pos
    
    while state != goal_pos:
        action = choose_action(state)
        next_state = get_next_state(state, action)
        reward = get_reward(next_state)
        
        # Actualizar Q-table
        x, y = state
        nx, ny = next_state
        Q[x, y, action] = Q[x, y, action] + alpha * (
            reward + gamma * np.max(Q[nx, ny]) - Q[x, y, action]
        )
        
        state = next_state

# Mostrar política aprendida
print("Política óptima aprendida:")
for x in range(grid_size):
    for y in range(grid_size):
        if (x, y) == goal_pos:
            print("G", end="  ")
        elif (x, y) in obstacles:
            print("X", end="  ")
        else:
            best_action = np.argmax(Q[x, y])
            symbols = ["↑", "→", "↓", "←"]
            print(symbols[best_action], end="  ")
    print()

print(f"\\nValor máximo Q en el objetivo: {np.max(Q[goal_pos]):.3f}")
`
    },
    
    comparison: {
      title: 'Comparación de Algoritmos',
      description: 'Comparación entre Q-learning y SARSA en el mismo entorno',
      difficulty: 'avanzado',
      concepts: ['Q-learning vs SARSA', 'On-policy vs Off-policy', 'Convergencia'],
      code: `import numpy as np
import random

# Configuración del entorno
n_states = 6
actions = [0, 1]  # izquierda, derecha
rewards = [0, 0, -1, 0, 0, 10]  # trampa en estado 2, objetivo en 5

# Parámetros de aprendizaje
alpha = 0.1
gamma = 0.9
epsilon = 0.1
episodes = 1000

def get_next_state(state, action):
    if action == 0:  # izquierda
        return max(0, state - 1)
    else:  # derecha
        return min(n_states - 1, state + 1)

def choose_action(Q, state, epsilon):
    if random.uniform(0, 1) < epsilon:
        return random.choice(actions)
    else:
        return np.argmax(Q[state])

# Q-Learning
Q_qlearning = np.zeros((n_states, len(actions)))
qlearning_rewards = []

for episode in range(episodes):
    state = 0
    total_reward = 0
    
    while state != 5:  # hasta llegar al objetivo
        action = choose_action(Q_qlearning, state, epsilon)
        next_state = get_next_state(state, action)
        reward = rewards[next_state]
        
        # Q-learning update (off-policy)
        Q_qlearning[state, action] += alpha * (
            reward + gamma * np.max(Q_qlearning[next_state]) - Q_qlearning[state, action]
        )
        
        state = next_state
        total_reward += reward
        
        if len(qlearning_rewards) < 20:  # evitar bucle infinito
            break
    
    qlearning_rewards.append(total_reward)

# SARSA
Q_sarsa = np.zeros((n_states, len(actions)))
sarsa_rewards = []

for episode in range(episodes):
    state = 0
    action = choose_action(Q_sarsa, state, epsilon)
    total_reward = 0
    
    while state != 5:
        next_state = get_next_state(state, action)
        reward = rewards[next_state]
        next_action = choose_action(Q_sarsa, next_state, epsilon)
        
        # SARSA update (on-policy)
        Q_sarsa[state, action] += alpha * (
            reward + gamma * Q_sarsa[next_state, next_action] - Q_sarsa[state, action]
        )
        
        state = next_state
        action = next_action
        total_reward += reward
        
        if len(sarsa_rewards) < 20:
            break
    
    sarsa_rewards.append(total_reward)

# Resultados
print("=== COMPARACIÓN Q-LEARNING vs SARSA ===")
print("\\nQ-Learning (Off-policy):")
print("Q-table final:")
print(Q_qlearning)
print(f"Recompensa promedio últimos 100 episodios: {np.mean(qlearning_rewards[-100:]):.3f}")

print("\\nSARSA (On-policy):")
print("Q-table final:")
print(Q_sarsa)
print(f"Recompensa promedio últimos 100 episodios: {np.mean(sarsa_rewards[-100:]):.3f}")

print("\\nDiferencias clave:")
print("- Q-learning aprende la política óptima independientemente de la exploración")
print("- SARSA aprende la política que realmente sigue (incluyendo exploración)")
print("- Q-learning puede ser más agresivo en entornos con riesgos")
print("- SARSA tiende a ser más conservador")
`
    },
    
    interactive: {
      title: 'Simulación Interactiva',
      description: 'Simulación paso a paso de Q-learning con visualización detallada',
      difficulty: 'intermedio',
      concepts: ['Simulación paso a paso', 'Visualización', 'Análisis de convergencia'],
      code: `import numpy as np
import random

# Configuración
n_states = 4
actions = [0, 1]  # izquierda, derecha
rewards = [0, 0, 0, 1]

# Parámetros
alpha = 0.2
gamma = 0.9
epsilon = 0.3

# Inicializar Q-table
Q = np.zeros((n_states, len(actions)))

def choose_action(state, epsilon):
    if random.uniform(0, 1) < epsilon:
        return random.choice(actions)
    else:
        return np.argmax(Q[state])

def get_next_state(state, action):
    if action == 0:  # izquierda
        return max(0, state - 1)
    else:  # derecha
        return min(n_states - 1, state + 1)

def print_q_table():
    print("\\nQ-table actual:")
    print("Estado | Izq(0) | Der(1) | Mejor")
    print("-" * 35)
    for s in range(n_states):
        best_action = np.argmax(Q[s])
        print(f"   {s}   | {Q[s,0]:6.3f} | {Q[s,1]:6.3f} | {'←' if best_action == 0 else '→'}")

def simulate_episode(episode_num, show_steps=False):
    state = 0
    steps = 0
    total_reward = 0
    
    if show_steps:
        print(f"\\n=== EPISODIO {episode_num + 1} ===")
    
    while state != 3 and steps < 50:  # límite de pasos
        action = choose_action(state, epsilon)
        next_state = get_next_state(state, action)
        reward = rewards[next_state]
        
        if show_steps:
            action_name = "izquierda" if action == 0 else "derecha"
            print(f"Paso {steps + 1}: Estado {state} -> {action_name} -> Estado {next_state} (R={reward})")
        
        # Actualizar Q-table
        old_q = Q[state, action]
        Q[state, action] += alpha * (
            reward + gamma * np.max(Q[next_state]) - Q[state, action]
        )
        
        if show_steps:
            print(f"  Q[{state},{action}]: {old_q:.3f} -> {Q[state, action]:.3f}")
        
        state = next_state
        total_reward += reward
        steps += 1
    
    return total_reward, steps

# Simulación con visualización
print("=== SIMULACIÓN INTERACTIVA DE Q-LEARNING ===")
print("Entorno: 4 estados (0->1->2->3), recompensa 1 solo en estado 3")
print(f"Parámetros: α={alpha}, γ={gamma}, ε={epsilon}")

# Mostrar primeros episodios en detalle
detailed_episodes = [0, 1, 2, 9, 24, 49, 99]
rewards_history = []

for episode in range(100):
    show_detail = episode in detailed_episodes
    reward, steps = simulate_episode(episode, show_detail)
    rewards_history.append(reward)
    
    if show_detail:
        print_q_table()
        print(f"Recompensa total: {reward}, Pasos: {steps}")
        print("-" * 50)

# Análisis final
print("\\n=== ANÁLISIS FINAL ===")
print_q_table()
print(f"\\nRecompensa promedio últimos 20 episodios: {np.mean(rewards_history[-20:]):.3f}")
print(f"Convergencia: {'Sí' if np.mean(rewards_history[-10:]) >= 0.9 else 'Parcial'}")

# Política óptima
print("\\nPolítica óptima aprendida:")
for state in range(n_states):
    best_action = np.argmax(Q[state])
    direction = "derecha" if best_action == 1 else "izquierda"
    confidence = Q[state, best_action] - Q[state, 1-best_action]
    print(f"Estado {state}: {direction} (confianza: {confidence:.3f})")
`
    }
  };

  constructor(
    private pyodideService: PyodideService,
    private monacoService: MonacoEditorService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeServices();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.monacoService.dispose();
    }
  }

  private async initializeServices(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Inicializar Pyodide
      await this.pyodideService.init();
      
      // Obtener el contenedor del editor
      const editorContainer = document.getElementById('code-editor');
      if (editorContainer) {
        // Inicializar Monaco Editor
        await this.monacoService.initEditor(editorContainer, this.examples[this.selectedExample].code);
      }
      
      this.isLoading = false;
    } catch (error) {
      this.error = `Error al inicializar los servicios: ${error}`;
      this.isLoading = false;
    }
  }

  async selectExample(exampleKey: string): Promise<void> {
    if (this.examples[exampleKey] && !this.isRunning) {
      this.selectedExample = exampleKey;
      this.output = '';
      this.error = null;
      
      if (isPlatformBrowser(this.platformId)) {
        this.monacoService.setValue(this.examples[exampleKey].code);
      }
    }
  }

  async runCode(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this.error = 'El código solo puede ejecutarse en el navegador.';
      return;
    }

    this.isRunning = true;
    this.error = null;
    this.output = '';

    try {
      const code = this.monacoService.getValue();
      if (!code.trim()) {
        this.error = 'Por favor, ingresa código Python para ejecutar.';
        this.isRunning = false;
        return;
      }

      const result = await this.pyodideService.runCode(code);
      
      if (result.error) {
        this.error = result.error;
      } else {
        this.output = result.output;
      }
    } catch (error) {
      this.error = `Error de ejecución: ${error}`;
    } finally {
      this.isRunning = false;
    }
  }

  getExampleKeys(): string[] {
    return Object.keys(this.examples);
  }

  getSelectedExample(): ExampleInfo {
    return this.examples[this.selectedExample];
  }

  getDifficultyColor(difficulty: string): string {
    const colors = {
      'básico': '#10B981',
      'intermedio': '#F59E0B', 
      'avanzado': '#EF4444'
    };
    return colors[difficulty as keyof typeof colors] || '#6B7280';
  }
}
