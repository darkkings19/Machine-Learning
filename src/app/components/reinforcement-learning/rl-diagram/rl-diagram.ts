import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-rl-diagram',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './rl-diagram.html',
  styleUrl: './rl-diagram.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: '0px', opacity: 0, overflow: 'hidden' }),
        animate('400ms ease-in-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('400ms ease-in-out', style({ height: '0px', opacity: 0 }))
      ])
    ]),
    trigger('fadeInOut', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      state('out', style({ opacity: 0, transform: 'translateY(-10px)' })),
      transition('out => in', animate('300ms ease-in')),
      transition('in => out', animate('300ms ease-out'))
    ])
  ]
})
export class RlDiagramComponent implements OnInit, AfterViewInit {
  @ViewChild('maze') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private animationId!: number;
  
  // Configuración del laberinto
  rows = 5;
  cols = 5;
  cellSize = 60;
  
  // Posiciones importantes
  agentStart = [0, 0];
  agentPos: [number, number] = [0, 0];
  goal = [4, 4];
  
  // Obstáculos en el laberinto
  obstacles = [
    [1, 1], [1, 3], [2, 1], [3, 1], [3, 2], [3, 3]
  ];
  
  // Parámetros de Q-learning
  learningRate = 0.1;
  discountFactor = 0.9;
  epsilon = 0.3;
  
  // Tabla Q y estadísticas
  qTable: number[][][] = [];
  episodes = 0;
  maxEpisodes = 1000;
  totalReward = 0;
  currentEpisodeReward = 0;
  episodeLengths: number[] = [];
  isTraining = false;
  trainingSpeed = 10; // Velocidad de entrenamiento más rápida por defecto
  fastTraining = true; // Modo de entrenamiento rápido por defecto
  
  // Criterios de convergencia mejorados
  convergenceThreshold = 0.01; // Umbral para considerar convergencia
  stableEpisodes = 0; // Contador de episodios estables
  requiredStableEpisodes = 50; // Episodios consecutivos estables requeridos
  recentRewards: number[] = []; // Historial reciente de recompensas
  maxRecentRewards = 100; // Tamaño de ventana para análisis
  isConverged = false; // Indicador de convergencia
  convergenceReason = ''; // Razón de finalización
  
  // Estados de la interfaz
  showQValues = false;
  showQTable = false;
  initialEpsilon = 0.3;
  isDemonstrating = false; // Estado de demostración
  
  // Alias para compatibilidad con el template
  get episode(): number {
    return this.episodes;
  }

  // Modos de edición
  isDragging = false;
  isMouseDown = false;
  
  // Acciones posibles: arriba, derecha, abajo, izquierda
  actions = [
    [-1, 0], // arriba
    [0, 1],  // derecha
    [1, 0],  // abajo
    [0, -1]  // izquierda
  ];
  
  actionNames = ['↑', '→', '↓', '←'];

  // Almacena la ruta de la demostración
  demoPath: [number, number][] = [];

  ngOnInit() {
    this.initializeQTable();
    this.resetAgent();
  }

  ngAfterViewInit() {
    if (typeof document !== 'undefined' && this.canvasRef?.nativeElement) {
      this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
      this.updateCanvasSize();
      this.drawMaze();
    }
  }

  initializeQTable() {
    this.qTable = [];
    for (let i = 0; i < this.rows; i++) {
      this.qTable[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.qTable[i][j] = [0, 0, 0, 0]; // 4 acciones posibles
      }
    }
  }

  // Utilidad para obtener color CSS
  private getColor(varName: string, fallback: string): string {
    if (typeof document !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(varName) || fallback;
    }
    return fallback;
  }

  private drawArrow(x: number, y: number, dx: number, dy: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + dx, y + dy);
    this.ctx.stroke();
    this.ctx.beginPath();
    if (dx === 0) {
      this.ctx.moveTo(x - this.cellSize * 0.1, y + dy);
      this.ctx.lineTo(x + this.cellSize * 0.1, y + dy);
      this.ctx.lineTo(x, y + dy + (dy > 0 ? this.cellSize * 0.1 : -this.cellSize * 0.1));
    } else {
      this.ctx.moveTo(x + dx, y - this.cellSize * 0.1);
      this.ctx.lineTo(x + dx, y + this.cellSize * 0.1);
      this.ctx.lineTo(x + dx + (dx > 0 ? this.cellSize * 0.1 : -this.cellSize * 0.1), y);
    }
    this.ctx.fill();
  }

  drawMaze() {
    if (!this.ctx || typeof document === 'undefined') {
      // Si no hay contexto, intentar reinicializarlo
      if (this.canvasRef?.nativeElement) {
        this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
      }
      if (!this.ctx) return;
    }
    
    const canvasWidth = this.cols * this.cellSize;
    const canvasHeight = this.rows * this.cellSize;
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Dibujar flechas de política
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.isObstacle(y, x) || (x === this.goal[1] && y === this.goal[0])) continue;
        const q = this.qTable[y]?.[x];
        if (q) {
          const best = q.indexOf(Math.max(...q));
          const cx = x * this.cellSize + this.cellSize / 2;
          const cy = y * this.cellSize + this.cellSize / 2;
          const offset = this.cellSize * 0.2;
          this.ctx.save();
          this.ctx.strokeStyle = '#000';
          this.ctx.fillStyle = '#000';
          switch (best) {
            case 0: this.drawArrow(cx, cy, 0, -offset); break; // arriba
            case 1: this.drawArrow(cx, cy, offset, 0); break; // derecha
            case 2: this.drawArrow(cx, cy, 0, offset); break; // abajo
            case 3: this.drawArrow(cx, cy, -offset, 0); break; // izquierda
          }
          this.ctx.restore();
        }
      }
    }

    // Dibujar rastro de la ruta durante demostración
    if (this.isDemonstrating && this.demoPath && this.demoPath.length > 1) {
      this.ctx.save();
      this.ctx.strokeStyle = this.getColor('--color-path', '#ff9800');
      this.ctx.lineWidth = Math.max(3, this.cellSize * 0.2);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();
      for (let i = 0; i < this.demoPath.length; i++) {
        const [row, col] = this.demoPath[i];
        const cx = col * this.cellSize + this.cellSize / 2;
        const cy = row * this.cellSize + this.cellSize / 2;
        if (i === 0) {
          this.ctx.moveTo(cx, cy);
        } else {
          this.ctx.lineTo(cx, cy);
        }
      }
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Dibujar grid
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.rows; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.cellSize);
      this.ctx.lineTo(canvasWidth, i * this.cellSize);
      this.ctx.stroke();
    }
    for (let j = 0; j <= this.cols; j++) {
      this.ctx.beginPath();
      this.ctx.moveTo(j * this.cellSize, 0);
      this.ctx.lineTo(j * this.cellSize, canvasHeight);
      this.ctx.stroke();
    }

    // Dibujar obstáculos
    this.ctx.fillStyle = this.getColor('--color-wall', '#333');
    this.obstacles.forEach(([row, col]) => {
      if (row < this.rows && col < this.cols) {
        this.ctx.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
      }
    });

    // Dibujar meta
    this.ctx.fillStyle = this.getColor('--color-goal', '#4CAF50');
    this.ctx.fillRect(this.goal[1] * this.cellSize, this.goal[0] * this.cellSize, this.cellSize, this.cellSize);
    this.ctx.fillStyle = 'white';
    this.ctx.font = `${Math.max(12, this.cellSize * 0.4)}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      '',
      this.goal[1] * this.cellSize + this.cellSize / 2,
      this.goal[0] * this.cellSize + this.cellSize / 2 + 4
    );

    // Dibujar agente
    this.ctx.fillStyle = this.getColor('--color-agent', '#2196F3');
    this.ctx.beginPath();
    this.ctx.arc(
      this.agentPos[1] * this.cellSize + this.cellSize / 2,
      this.agentPos[0] * this.cellSize + this.cellSize / 2,
      Math.max(8, this.cellSize / 3),
      0,
      2 * Math.PI
    );
    this.ctx.fill();
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    if (this.showQValues) {
      this.drawQValues();
    }
  }

  drawQValues() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.font = `${Math.max(8, this.cellSize * 0.15)}px Arial`;
    this.ctx.textAlign = 'center';
    
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this.isObstacle(i, j)) continue;
        
        const x = j * this.cellSize;
        const y = i * this.cellSize;
        const qValues = this.qTable[i][j];
        
        // Mostrar valores Q para cada acción (solo si la celda es lo suficientemente grande)
        if (this.cellSize > 40) {
          this.ctx.fillText(qValues[0].toFixed(1), x + this.cellSize/2, y + 15); // arriba
          this.ctx.fillText(qValues[1].toFixed(1), x + this.cellSize - 10, y + this.cellSize/2); // derecha
          this.ctx.fillText(qValues[2].toFixed(1), x + this.cellSize/2, y + this.cellSize - 5); // abajo
          this.ctx.fillText(qValues[3].toFixed(1), x + 10, y + this.cellSize/2); // izquierda
        } else {
          // Para celdas pequeñas, mostrar solo el valor máximo
          const maxQ = Math.max(...qValues);
          this.ctx.fillText(maxQ.toFixed(1), x + this.cellSize/2, y + this.cellSize/2 + 3);
        }
      }
    }
  }

  isObstacle(row: number, col: number): boolean {
    // Validar límites del laberinto
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return true;
    return this.obstacles.some(([r, c]) => r === row && c === col);
  }

  isValidMove(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols && !this.isObstacle(row, col);
  }

  getReward(row: number, col: number): number {
    if (row === this.goal[0] && col === this.goal[1]) {
      return 100; // Recompensa por llegar a la meta
    }
    return -1; // Penalización por cada paso
  }

  chooseAction(row: number, col: number): number {
    // Validar límites del laberinto
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return Math.floor(Math.random() * 4); // Acción aleatoria si está fuera de límites
    }
    
    // Estrategia epsilon-greedy
    if (Math.random() < this.epsilon) {
      // Exploración: acción aleatoria
      return Math.floor(Math.random() * 4);
    } else {
      // Explotación: mejor acción conocida
      const qValues = this.qTable[row][col];
      return qValues.indexOf(Math.max(...qValues));
    }
  }

  updateQValue(currentRow: number, currentCol: number, action: number, 
               nextRow: number, nextCol: number, reward: number) {
    // Validar límites del laberinto para ambas posiciones
    if (currentRow < 0 || currentRow >= this.rows || currentCol < 0 || currentCol >= this.cols ||
        nextRow < 0 || nextRow >= this.rows || nextCol < 0 || nextCol >= this.cols) {
      return; // No actualizar Q si alguna posición está fuera de límites
    }
    
    const currentQ = this.qTable[currentRow][currentCol][action];
    const maxNextQ = Math.max(...this.qTable[nextRow][nextCol]);
    
    const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
    this.qTable[currentRow][currentCol][action] = newQ;
  }

  async runEpisode(): Promise<number> {
    this.resetAgent();
    let episodeReward = 0;
    let steps = 0;
    const maxSteps = 100;
    
    while (steps < maxSteps) {
      const currentRow = this.agentPos[0];
      const currentCol = this.agentPos[1];
      
      // Elegir acción
      const action = this.chooseAction(currentRow, currentCol);
      const [deltaRow, deltaCol] = this.actions[action];
      
      // Calcular nueva posición
      let nextRow = currentRow + deltaRow;
      let nextCol = currentCol + deltaCol;
      
      // Verificar si el movimiento es válido
      if (!this.isValidMove(nextRow, nextCol)) {
        nextRow = currentRow;
        nextCol = currentCol;
      }
      
      // Obtener recompensa
      const reward = this.getReward(nextRow, nextCol);
      episodeReward += reward;
      
      // Actualizar tabla Q
      this.updateQValue(currentRow, currentCol, action, nextRow, nextCol, reward);
      
      // Mover agente
      this.agentPos = [nextRow, nextCol];
      
      steps++;
      
      // Verificar si llegó a la meta
      if (nextRow === this.goal[0] && nextCol === this.goal[1]) {
        break;
      }
      
      // Pausa para visualización durante entrenamiento
      if (this.isTraining && !this.fastTraining && this.trainingSpeed > 1) {
        this.drawMaze();
        await this.sleep(this.trainingSpeed);
      }
    }
    
    return episodeReward;
  }

  async startTraining() {
    this.isTraining = true;
    this.episodes = 0;
    this.totalReward = 0;
    this.episodeLengths = [];
    // Asegurarse de que el rastro de demostración esté vacío durante el entrenamiento
    this.demoPath = [];
    // Restablecer epsilon al valor inicial
    this.epsilon = this.initialEpsilon;
    
    for (let episode = 0; episode < this.maxEpisodes && this.isTraining; episode++) {
      const episodeReward = await this.runEpisode();
      this.episodes++;
      this.totalReward += episodeReward;
      this.currentEpisodeReward = episodeReward;
      // Decaimiento del epsilon
      this.epsilon = this.initialEpsilon * Math.exp(-episode / (this.maxEpisodes * 0.1));
      
      // Actualizar visualización basado en el modo de entrenamiento
      if (this.fastTraining) {
        // Modo rápido: actualizar cada 25 episodios
        if (episode % 25 === 0) {
          this.drawMaze();
          await this.sleep(1); // Pausa mínima para permitir actualización de UI
        }
      } else {
        // Modo normal: actualizar más frecuentemente
        if (this.trainingSpeed > 50) {
          this.drawMaze();
        } else if (episode % 5 === 0) {
          this.drawMaze();
        }
        // Permitir que la UI se actualice ocasionalmente
        if (episode % 10 === 0) {
          await this.sleep(1);
        }
      }
    }
    this.isTraining = false;
    this.demoPath = []; // Limpiar demoPath al terminar entrenamiento
    this.drawMaze();
  }

  stopTraining() {
    this.isTraining = false;
  }

  resetAgent() {
    // Asegurar que la posición inicial del agente esté dentro de los límites
    this.agentStart[0] = Math.max(0, Math.min(this.agentStart[0], this.rows - 1));
    this.agentStart[1] = Math.max(0, Math.min(this.agentStart[1], this.cols - 1));
    
    // Asegurar que la meta esté dentro de los límites
    this.goal[0] = Math.max(0, Math.min(this.goal[0], this.rows - 1));
    this.goal[1] = Math.max(0, Math.min(this.goal[1], this.cols - 1));
    
    this.agentPos = [this.agentStart[0], this.agentStart[1]];
    this.currentEpisodeReward = 0;
  }

  resetTraining() {
    this.stopTraining();
    this.initializeQTable();
    this.resetAgent();
    this.episodes = 0;
    this.totalReward = 0;
    this.episodeLengths = [];
    this.epsilon = this.initialEpsilon;
    this.demoPath = [];
    this.drawMaze();
  }

  toggleQValues() {
    this.showQValues = !this.showQValues;
    this.drawMaze();
  }

  async demonstrateLearning() {
    if (this.isDemonstrating || this.isTraining) return;
    
    this.isDemonstrating = true;
    this.resetAgent();
    
    const originalEpsilon = this.epsilon;
    this.epsilon = 0; // Sin exploración, solo explotación
    this.demoPath = [[this.agentPos[0], this.agentPos[1]]];
    
    let steps = 0;
    const maxSteps = 50;
    
    while (steps < maxSteps && this.isDemonstrating) {
      const currentRow = this.agentPos[0];
      const currentCol = this.agentPos[1];
      
      // Verificar si llegó a la meta
      if (currentRow === this.goal[0] && currentCol === this.goal[1]) {
        break;
      }
      
      // Elegir la mejor acción basada en los valores Q aprendidos
      const qValues = this.qTable[currentRow][currentCol];
      const action = qValues.indexOf(Math.max(...qValues));
      const [deltaRow, deltaCol] = this.actions[action];
      
      let nextRow = currentRow + deltaRow;
      let nextCol = currentCol + deltaCol;
      
      // Verificar si el movimiento es válido
      if (!this.isValidMove(nextRow, nextCol)) {
        // Si el movimiento no es válido, intentar con la segunda mejor acción
        const sortedActions = qValues
          .map((value, index) => ({value, index}))
          .sort((a, b) => b.value - a.value);
        
        let validMoveFound = false;
        for (const actionData of sortedActions) {
          const [testDeltaRow, testDeltaCol] = this.actions[actionData.index];
          const testNextRow = currentRow + testDeltaRow;
          const testNextCol = currentCol + testDeltaCol;
          
          if (this.isValidMove(testNextRow, testNextCol)) {
            nextRow = testNextRow;
            nextCol = testNextCol;
            validMoveFound = true;
            break;
          }
        }
        
        // Si no hay movimiento válido, mantenerse en la posición actual
        if (!validMoveFound) {
          nextRow = currentRow;
          nextCol = currentCol;
        }
      }
      
      // Mover agente
      this.agentPos = [nextRow, nextCol];
      this.demoPath.push([nextRow, nextCol]);
      
      // Redibujar el laberinto con la nueva posición
      this.drawMaze();
      
      // Pausa para visualización (velocidad fija de 300ms)
      await this.sleep(300);
      
      steps++;
    }
    
    // Restaurar epsilon original
    this.epsilon = originalEpsilon;
    this.isDemonstrating = false;
    
    // Mantener el camino visible por un momento antes de limpiar
    await this.sleep(2000);
    this.demoPath = [];
    this.drawMaze();
  }

  onSpeedChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.trainingSpeed = parseInt(target.value);
  }

  onLearningRateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.learningRate = parseFloat(target.value);
  }

  onEpsilonChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.epsilon = parseFloat(target.value);
  }

  // Métodos de configuración
  onMazeSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value);
    this.rows = newSize;
    this.cols = newSize;

    // Recalcular tamaño de celda para mantener el canvas manejable
    this.cellSize = Math.max(30, Math.min(80, 400 / newSize));

    // Ajustar posiciones si están fuera del nuevo laberinto
    this.goal = [newSize - 1, newSize - 1];
    this.agentStart = [0, 0];
    this.agentPos = [0, 0];

    // Generar automáticamente un laberinto aleatorio con camino válido
    this.generateRandomMazeWithPath();

    // Reinicializar la tabla Q
    this.initializeQTable();
    
    // Usar setTimeout para asegurar que el DOM se actualice antes de redibujar
    setTimeout(() => {
      this.updateCanvasSize();
      if (this.ctx) {
        this.drawMaze();
      }
    }, 0);
  }

  /**
   * Genera un laberinto aleatorio que garantiza al menos un camino válido
   * entre el agente y la meta usando un algoritmo mejorado.
   */
  generateRandomMazeWithPath() {
    // Limpiar obstáculos
    this.obstacles = [];
    
    // Crear un camino directo simple primero
    const pathCells = new Set<string>();
    
    // Crear un camino básico usando A* o simplemente líneas rectas
    let currentRow = this.agentStart[0];
    let currentCol = this.agentStart[1];
    
    // Añadir posición inicial al camino
    pathCells.add(`${currentRow},${currentCol}`);
    
    // Camino hacia la meta (mixto: hacia la derecha y hacia abajo)
    while (currentRow !== this.goal[0] || currentCol !== this.goal[1]) {
      // Decidir si moverse horizontal o verticalmente
      if (currentRow < this.goal[0] && (currentCol === this.goal[1] || Math.random() < 0.5)) {
        currentRow++;
      } else if (currentCol < this.goal[1]) {
        currentCol++;
      } else if (currentRow < this.goal[0]) {
        currentRow++;
      }
      
      pathCells.add(`${currentRow},${currentCol}`);
    }
    
    // Añadir algunas celdas adyacentes al camino para hacer más navegable
    const expandedPath = new Set(pathCells);
    for (const cellKey of pathCells) {
      const [r, c] = cellKey.split(',').map(Number);
      for (const [dr, dc] of this.actions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          if (Math.random() < 0.3) { // 30% de probabilidad de expandir el camino
            expandedPath.add(`${nr},${nc}`);
          }
        }
      }
    }
    
    // Añadir muros aleatorios en las celdas que no son parte del camino
    const density = 0.2; // Reducir densidad para mejor navegabilidad
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const cellKey = `${i},${j}`;
        
        // No poner muro en el camino garantizado
        if (expandedPath.has(cellKey)) continue;
        
        // No poner muro en la posición del agente o la meta
        if ((i === this.agentStart[0] && j === this.agentStart[1]) || 
            (i === this.goal[0] && j === this.goal[1])) continue;
            
        // No poner muros inmediatamente adyacentes al agente o la meta
        if ((Math.abs(i - this.agentStart[0]) <= 1 && Math.abs(j - this.agentStart[1]) <= 1) ||
            (Math.abs(i - this.goal[0]) <= 1 && Math.abs(j - this.goal[1]) <= 1)) continue;
        
        if (Math.random() < density) {
          this.obstacles.push([i, j]);
        }
      }
    }
  }

  onDiscountFactorChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.discountFactor = parseFloat(target.value);
  }

  // Variables para arrastre inteligente
  private draggingType: 'agent' | 'goal' | 'none' = 'none';

  // Métodos de manejo de eventos del mouse
  onCanvasMouseDown(event: MouseEvent) {
    if (this.isTraining) return;
    this.isMouseDown = true;
    const {row, col} = this.getCellFromEvent(event);
    
    // Validar que las coordenadas están dentro del laberinto
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    
    if (row === this.agentPos[0] && col === this.agentPos[1]) {
      this.draggingType = 'agent';
    } else if (row === this.goal[0] && col === this.goal[1]) {
      this.draggingType = 'goal';
    } else {
      this.draggingType = 'none';
      this.toggleWall(row, col);
      this.drawMaze();
    }
  }

  onCanvasMouseMove(event: MouseEvent) {
    if (!this.isMouseDown || this.isTraining) return;
    const {row, col} = this.getCellFromEvent(event);
    
    // Validar que las coordenadas están dentro del laberinto
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    
    if (this.draggingType === 'agent') {
      if (!this.isObstacle(row, col) && (row !== this.goal[0] || col !== this.goal[1])) {
        this.agentStart = [row, col];
        this.agentPos = [row, col];
        this.drawMaze();
      }
    } else if (this.draggingType === 'goal') {
      if (!this.isObstacle(row, col) && (row !== this.agentPos[0] || col !== this.agentPos[1])) {
        this.goal = [row, col];
        this.drawMaze();
      }
    } else if (this.draggingType === 'none') {
      this.toggleWall(row, col);
      this.drawMaze();
    }
  }

  onCanvasMouseUp(event: MouseEvent) {
    this.isMouseDown = false;
    this.draggingType = 'none';
  }

  onCanvasMouseLeave(event: MouseEvent) {
    this.isMouseDown = false;
    this.draggingType = 'none';
  }

  private getCellFromEvent(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    // Asegurar que las coordenadas estén dentro de los límites del laberinto
    const clampedRow = Math.max(0, Math.min(row, this.rows - 1));
    const clampedCol = Math.max(0, Math.min(col, this.cols - 1));
    
    return {row: clampedRow, col: clampedCol};
  }

  private toggleWall(row: number, col: number) {
    // Validar que las coordenadas están dentro del laberinto
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    
    // No permitir muros en la posición del agente o la meta
    if ((row === this.agentPos[0] && col === this.agentPos[1]) ||
        (row === this.goal[0] && col === this.goal[1])) {
      return;
    }

    const obstacleIndex = this.obstacles.findIndex(([r, c]) => r === row && c === col);
    
    if (obstacleIndex >= 0) {
      // Quitar muro
      this.obstacles.splice(obstacleIndex, 1);
    } else {
      // Agregar muro
      this.obstacles.push([row, col]);
    }
  }

  private moveAgent(row: number, col: number) {
    // Validar que las coordenadas están dentro del laberinto
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    
    // No permitir mover el agente a un muro o a la meta
    if (this.isObstacle(row, col) || (row === this.goal[0] && col === this.goal[1])) {
      return;
    }

    this.agentStart = [row, col];
    this.agentPos = [row, col];
  }

  private moveGoal(row: number, col: number) {
    // Validar que las coordenadas están dentro del laberinto
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    
    // No permitir mover la meta a un muro o a la posición del agente
    if (this.isObstacle(row, col) || (row === this.agentPos[0] && col === this.agentPos[1])) {
      return;
    }

    this.goal = [row, col];
  }

  private updateCanvasSize() {
    if (this.canvasRef?.nativeElement) {
      const canvas = this.canvasRef.nativeElement;
      canvas.width = this.cols * this.cellSize;
      canvas.height = this.rows * this.cellSize;
      
      // Reinicializar el contexto después del cambio de tamaño
      this.ctx = canvas.getContext('2d')!;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Propiedades calculadas para la interfaz
  get averageReward(): number {
    return this.episodes > 0 ? this.totalReward / this.episodes : 0;
  }

  get progressPercentage(): number {
    return (this.episodes / this.maxEpisodes) * 100;
  }

  generateRandomMaze() {
    if (this.isTraining) return;
    
    this.obstacles = [];
    const density = 0.25; // 25% de densidad de obstáculos
    
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        // No generar obstáculos en posición inicial del agente, meta, o adyacentes
        if ((i === this.agentStart[0] && j === this.agentStart[1]) ||
            (i === this.goal[0] && j === this.goal[1]) ||
            (Math.abs(i - this.agentStart[0]) <= 1 && Math.abs(j - this.agentStart[1]) <= 1) ||
            (Math.abs(i - this.goal[0]) <= 1 && Math.abs(j - this.goal[1]) <= 1)) {
          continue;
        }
        
        if (Math.random() < density) {
          this.obstacles.push([i, j]);
        }
      }
    }
    
    this.initializeQTable();
    this.drawMaze();
  }

  clearMaze() {
    if (this.isTraining) return;
    
    this.obstacles = [];
    this.initializeQTable();
    this.drawMaze();
  }

  // Métodos adicionales para el template
  reset() {
    this.resetTraining();
  }

  onMouseDown(event: MouseEvent) {
    this.onCanvasMouseDown(event);
  }

  onMouseMove(event: MouseEvent) {
    this.onCanvasMouseMove(event);
  }

  onMouseUp() {
    this.onCanvasMouseUp(null as any);
  }

  demonstrateBestPath() {
    this.demonstrateLearning();
  }

  getMaxQValue(row: number, col: number): number {
    // Validar límites del laberinto
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return 0;
    if (!this.qTable[row] || !this.qTable[row][col]) return 0;
    return Math.max(...this.qTable[row][col]);
  }

  getQValueColor(value: number): string {
    if (value < -10) return 'bg-red-200 text-red-800';
    if (value < 0) return 'bg-yellow-200 text-yellow-800';
    if (value < 10) return 'bg-blue-200 text-blue-800';
    return 'bg-green-200 text-green-800';
  }
}
