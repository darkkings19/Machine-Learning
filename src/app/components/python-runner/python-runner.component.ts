import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-python-runner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './python-runner.component.html',
  styleUrls: ['./python-runner.component.css']
})
export class PythonRunnerComponent implements OnInit {
  @Input() initialCode?: string;
  
  pyodide: any;
  output = '';
  userCode = `# Q-Learning Básico - Ejemplo completo
import numpy as np
import random

class QLearningAgent:
    def __init__(self, states, actions, alpha=0.1, gamma=0.9, epsilon=0.1):
        self.q_table = np.zeros((states, actions))
        self.alpha = alpha  # tasa de aprendizaje
        self.gamma = gamma  # factor de descuento
        self.epsilon = epsilon  # exploración
        self.states = states
        self.actions = actions
    
    def choose_action(self, state):
        # Estrategia epsilon-greedy
        if random.random() < self.epsilon:
            return random.randint(0, self.actions - 1)  # exploración
        return np.argmax(self.q_table[state])  # explotación
    
    def learn(self, state, action, reward, next_state):
        # Actualización Q-Learning usando ecuación de Bellman
        old_value = self.q_table[state, action]
        next_max = np.max(self.q_table[next_state])
        new_value = old_value + self.alpha * (reward + self.gamma * next_max - old_value)
        self.q_table[state, action] = new_value
    
    def print_q_table(self):
        print("📊 Tabla Q actual:")
        for i in range(self.states):
            print(f"Estado {i}: {self.q_table[i]}")

# Crear un entorno simple de Grid World (5x1)
class SimpleGridWorld:
    def __init__(self):
        self.states = 5
        self.goal_state = 4
        self.current_state = 0
    
    def reset(self):
        self.current_state = 0
        return self.current_state
    
    def step(self, action):
        # Acciones: 0 = izquierda, 1 = derecha
        if action == 0 and self.current_state > 0:
            self.current_state -= 1
        elif action == 1 and self.current_state < 4:
            self.current_state += 1
        
        # Recompensas
        if self.current_state == self.goal_state:
            reward = 10  # llegó al objetivo
        else:
            reward = -1  # penalización por cada paso
        
        return self.current_state, reward

# Entrenar el agente
print("🚀 Iniciando entrenamiento de Q-Learning")
print("=" * 40)

env = SimpleGridWorld()
agent = QLearningAgent(states=5, actions=2)

episodes = 100
for episode in range(episodes):
    state = env.reset()
    total_reward = 0
    
    for step in range(10):  # máximo 10 pasos por episodio
        action = agent.choose_action(state)
        next_state, reward = env.step(action)
        agent.learn(state, action, reward, next_state)
        
        state = next_state
        total_reward += reward
        
        if state == env.goal_state:
            break
    
    if episode % 20 == 0:
        print(f"Episodio {episode}: Recompensa total = {total_reward}")

print("\\n✅ Entrenamiento completado!")
agent.print_q_table()

# Probar el agente entrenado
print("\\n🎮 Probando agente entrenado:")
state = env.reset()
path = [state]
for step in range(10):
    action = np.argmax(agent.q_table[state])  # siempre la mejor acción
    state, reward = env.step(action)
    path.append(state)
    if state == env.goal_state:
        break

print(f"Camino tomado: {' -> '.join(map(str, path))}")
print("🏆 ¡El agente ha aprendido a llegar al objetivo!")`;
  isLoading = true;
  isExecuting = false;

  async ngOnInit() {
    // Si se proporciona código inicial, usarlo
    if (this.initialCode) {
      this.userCode = this.initialCode;
    }
    
    try {
      this.output = 'Cargando Pyodide...';
      // @ts-ignore
      this.pyodide = await (window as any).loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
      });
      
      // Instalar librerías necesarias para machine learning
      this.output = 'Instalando librerías de Machine Learning (numpy, scikit-learn)...';
      await this.pyodide.loadPackage(['numpy', 'scikit-learn']);
      
      this.output = 'Pyodide cargado correctamente con librerías ML. ¡Listo para ejecutar código Python!';
      this.isLoading = false;
    } catch (error: any) {
      this.output = 'Error al cargar Pyodide o instalar librerías: ' + error.toString();
      this.isLoading = false;
    }
  }

  async runPythonCode(code: string) {
    if (!this.pyodide) {
      this.output = 'Pyodide no está cargado aún. Por favor, espera.';
      return;
    }

    if (!code.trim()) {
      this.output = 'Por favor, introduce código Python para ejecutar.';
      return;
    }

    this.isExecuting = true;
    try {
      // Configurar captura de salida
      this.pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);
      
      // Ejecutar el código del usuario
      const result = await this.pyodide.runPythonAsync(code);
      
      // Capturar la salida de print()
      const stdout = this.pyodide.runPython("sys.stdout.getvalue()");
      const stderr = this.pyodide.runPython("sys.stderr.getvalue()");
      
      // Restaurar salida estándar
      this.pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
      `);
      
      // Mostrar salida combinada
      let output = '';
      if (stdout) output += stdout;
      if (stderr) output += 'Errores:\n' + stderr;
      if (result !== undefined && result !== null) {
        output += (output ? '\n' : '') + `Resultado: ${result}`;
      }
      
      this.output = output || '[OK] Ejecutado correctamente.';
    } catch (error: any) {
      this.output = 'Error: ' + error.toString();
    } finally {
      this.isExecuting = false;
    }
  }

  clearOutput() {
    this.output = '';
  }
}
