import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var d3: any;

interface TreeNode {
  id?: string;
  name: string;
  type?: 'root' | 'decision' | 'leaf';
  children?: TreeNode[];
  parent?: TreeNode;
  x?: number;
  y?: number;
}

@Component({
  selector: 'app-dt-diagram',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dt-diagram.html',
  styleUrls: ['./dt-diagram.css']
})
export class DtDiagramComponent implements OnInit, AfterViewInit {
  @ViewChild('treeContainer', { static: false }) treeContainer!: ElementRef;
  @ViewChild('messageBox', { static: false }) messageBox!: ElementRef;

  treeData: TreeNode = {
    id: '1',
    name: 'Nodo Raíz',
    type: 'root',
    children: []
  };

  selectedNode: TreeNode | null = null;
  nodeCounter = 1;

  simulationInput: string = '';

  // Propiedades para simulación interactiva
  temperatureValue: number = 25;
  humidityValue: number = 50;
  windValue: string = 'medio';
  precipitationValue: string = 'ninguna';
  
  simulationResult: string = '';
  simulationPath: string[] = [];
  simulationNodeIds: string[] = []; // IDs de los nodos del camino
  decisionSteps: {condition: string, result: string}[] = [];
  isTreeLoaded: boolean = true; // Cambiar a true para que esté cargado por defecto

  // Propiedades para edición de valores de condiciones
  isEditingCondition: boolean = false;
  editingCondition: {
    attribute: string;
    operator: string;
    value: number | string;
    originalValue: number | string;
  } | null = null;

  svg: any;
  g: any;
  width = 1200;
  height = 800;
  root: any;

  ngOnInit() {
    // Cargar árbol de ejemplo por defecto
    this.loadDefaultTree();
  }

  ngAfterViewInit() {
    this.loadD3AndInitialize();
  }

  private loadD3AndInitialize() {
    if (typeof d3 !== 'undefined') {
      this.initializeTree();
    } else {
      const script = document.createElement('script');
      script.src = 'https://d3js.org/d3.v7.min.js';
      script.onload = () => {
        this.initializeTree();
      };
      document.head.appendChild(script);
    }
  }

  private initializeTree() {
    this.setupSVG();
    this.root = d3.hierarchy(this.treeData);
    this.updateTree();
  }

  private setupSVG() {
    d3.select(this.treeContainer.nativeElement).selectAll("*").remove();

    this.svg = d3.select(this.treeContainer.nativeElement)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("border", "1px solid #e2e8f0")
      .style("border-radius", "8px");

    this.g = this.svg.append("g")
      .attr("transform", "translate(80, 80)");

    this.svg.on("click", () => {
      this.selectedNode = null;
      this.updateTree();
      this.clearHighlights();
      this.showMessage('');
    });
  }

  updateTree() {
    const treeLayout = d3.tree().size([this.height - 200, this.width - 200]);
    this.root = d3.hierarchy(this.treeData);
    treeLayout(this.root);

    this.root.descendants().forEach((d: any) => d.y = d.depth * 180);

    this.g.selectAll(".link").remove();
    this.g.selectAll(".node").remove();

    // Dibuja enlaces con id único
    const links = this.g.selectAll(".link")
      .data(this.root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("id", (d: any) => `link-${d.source.data.id}-${d.target.data.id}`)
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x))
      .style("fill", "none")
      .style("stroke", "#cbd5e0")
      .style("stroke-width", 2);

    // Dibuja nodos con id único
    const nodes = this.g.selectAll(".node")
      .data(this.root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("id", (d: any) => `node-${d.data.id}`)
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
      .style("cursor", "pointer");

    nodes.append("circle")
      .attr("r", 30)
      .style("fill", (d: any) => {
        if (this.selectedNode && d.data.id === this.selectedNode.id) {
          return "#ff6b6b";
        }
        switch (d.data.type) {
          case 'root': return "#4ecdc4";
          case 'decision': return "#45b7d1";
          case 'leaf': return "#96ceb4";
          default: return "#ddd";
        }
      })
      .style("stroke", "#2d3748")
      .style("stroke-width", 2)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");

    nodes.append("rect")
      .attr("x", (d: any) => d.children ? -80 : 40)
      .attr("y", -12)
      .attr("width", (d: any) => Math.max(80, d.data.name.length * 8))
      .attr("height", 24)
      .attr("rx", 12)
      .style("fill", "rgba(255, 255, 255, 0.95)")
      .style("stroke", "#e2e8f0")
      .style("stroke-width", 1)
      .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.1))");

    nodes.append("text")
      .attr("dy", ".35em")
      .attr("x", (d: any) => d.children ? -40 : 80)
      .style("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", "#2d3748")
      .style("pointer-events", "none")
      .text((d: any) => {
        const text = d.data.name;
        const maxLength = 12;
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
      });

    nodes.append("title")
      .text((d: any) => `${d.data.name}\nTipo: ${d.data.type || 'undefined'}\nID: ${d.data.id || 'undefined'}`);

    nodes.on("click", (event: any, d: any) => {
      event.stopPropagation();
      this.selectNode(d.data);
    });
    
    // Ejecutar simulación automática después de actualizar el árbol
    setTimeout(() => {
      if (this.isTreeLoaded) {
        this.updateSimulation();
      }
    }, 50);
  }

  selectNode(node: TreeNode) {
    this.selectedNode = node;
    this.isEditingCondition = false;
    this.editingCondition = null;
    
    // Verificar si el nodo tiene una condición editable
    this.checkIfNodeHasEditableCondition(node);
    
    this.updateTree();
  }

  checkIfNodeHasEditableCondition(node: TreeNode) {
    if (node.type === 'leaf') return; // Los nodos hoja no tienen condiciones
    
    const condition = this.parseCondition(node.name);
    if (condition && (condition.op === '>' || condition.op === '<' || condition.op === '==' || condition.op === '!=')) {
      // Solo permitir edición de valores numéricos
      if (typeof condition.value === 'number') {
        this.editingCondition = {
          attribute: condition.attr,
          operator: condition.op,
          value: condition.value,
          originalValue: condition.value
        };
      }
    }
  }

  startEditingCondition() {
    if (this.editingCondition) {
      this.isEditingCondition = true;
    }
  }

  saveConditionEdit() {
    if (!this.selectedNode || !this.editingCondition) return;
    
    // Actualizar el nombre del nodo con el nuevo valor
    const newNodeName = `${this.editingCondition.attribute} ${this.editingCondition.operator} ${this.editingCondition.value}`;
    this.selectedNode.name = newNodeName;
    
    // Actualizar la condición original
    this.editingCondition.originalValue = this.editingCondition.value;
    this.isEditingCondition = false;
    
    this.updateTree();
    this.showMessage(`Condición actualizada: ${newNodeName}`);
  }

  cancelConditionEdit() {
    if (this.editingCondition) {
      this.editingCondition.value = this.editingCondition.originalValue;
    }
    this.isEditingCondition = false;
  }

  addChildNode() {
    if (!this.selectedNode) {
      alert('Selecciona un nodo primero');
      return;
    }

    this.nodeCounter++;
    const newNode: TreeNode = {
      id: this.nodeCounter.toString(),
      name: `Nodo ${this.nodeCounter}`,
      type: 'decision',
      children: [],
      parent: this.selectedNode
    };

    if (!this.selectedNode.children) {
      this.selectedNode.children = [];
    }

    this.selectedNode.children.push(newNode);
    this.updateTree();
  }

  deleteNode() {
    if (!this.selectedNode) {
      alert('Selecciona un nodo primero');
      return;
    }

    if (this.selectedNode.id === '1') {
      alert('No puedes eliminar el nodo raíz');
      return;
    }

    this.removeNodeFromTree(this.treeData, this.selectedNode.id!);
    this.selectedNode = null;
    this.updateTree();
  }

  private removeNodeFromTree(node: TreeNode, targetId: string): boolean {
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        if (node.children[i].id === targetId) {
          node.children.splice(i, 1);
          return true;
        }
        if (this.removeNodeFromTree(node.children[i], targetId)) {
          return true;
        }
      }
    }
    return false;
  }

  changeNodeType(type: 'decision' | 'leaf') {
    if (!this.selectedNode) {
      alert('Selecciona un nodo primero');
      return;
    }

    this.selectedNode.type = type;

    if (type === 'leaf') {
      this.selectedNode.children = [];
    } else if (!this.selectedNode.children) {
      this.selectedNode.children = [];
    }

    this.updateTree();
  }

  resetTree() {
    this.treeData = {
      id: '1',
      name: 'Nodo Raíz',
      type: 'root',
      children: []
    };
    this.selectedNode = null;
    this.nodeCounter = 1;
    this.updateTree();
  }

  exportTree() {
    const treeJson = JSON.stringify(this.treeData, null, 2);
    const blob = new Blob([treeJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arbol-decision.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  showMessage(text: string, timeout = 4000) {
    if (!this.messageBox) return;
    this.messageBox.nativeElement.textContent = text;
    if (timeout > 0) {
      setTimeout(() => {
        if (this.messageBox.nativeElement.textContent === text) {
          this.messageBox.nativeElement.textContent = '';
        }
      }, timeout);
    }
  }

  clearHighlights() {
    if (this.g) {
      // Limpiar SOLO las clases de camino, manteniendo los estilos originales
      this.g.selectAll('g.node').classed('path-node', false);
      this.g.selectAll('g.node').classed('path-result', false);
      this.g.selectAll('path.link').classed('path-link', false);
      
      // Limpiar SOLO los estilos de camino específicos, restaurando los originales
      this.g.selectAll('g.node circle')
        .style('stroke', null)        // Esto restaura el estilo CSS original
        .style('stroke-width', null)
        .style('fill', null)
        .style('filter', null);
      
      this.g.selectAll('g.node text')
        .style('fill', null)          // Esto restaura el estilo CSS original
        .style('font-weight', null);
      
      this.g.selectAll('path.link')
        .style('stroke', null)        // Esto restaura el estilo CSS original
        .style('stroke-width', null)
        .style('stroke-dasharray', null);
      
      // Eliminar números de secuencia
      this.g.selectAll('.sequence-number').remove();
    }
  }

  parseCondition(text: string) {
    // Limpiar el texto eliminando signos de pregunta y espacios extra
    const clean = text.replace(/[¿?]/g, '').trim();
    
    // Buscar diferentes patrones de condición
    const patterns = [
      /^(.+?)\s*(>=|<=|>|<|==|!=)\s*(.+?)$/,  // Operadores de comparación
      /^(.+?)\s+(mayor|menor|igual|diferente)\s+(que|a)\s+(.+?)$/i,  // Texto en español
      /^(.+?)\s+(>\s*=|<\s*=|>\s*|<\s*|=\s*=|!\s*=)\s*(.+?)$/  // Operadores con espacios
    ];
    
    for (const pattern of patterns) {
      const match = clean.match(pattern);
      if (match) {
        let attr = match[1].trim();
        let op = match[2].trim();
        let valRaw = match[3].trim();
        
        // Convertir operadores en español
        if (op.toLowerCase().includes('mayor')) op = '>';
        if (op.toLowerCase().includes('menor')) op = '<';
        if (op.toLowerCase().includes('igual')) op = '==';
        if (op.toLowerCase().includes('diferente')) op = '!=';
        
        // Normalizar operadores con espacios
        op = op.replace(/\s+/g, '');
        
        // Extraer el valor numérico si está presente
        const numMatch = valRaw.match(/(\d+(?:\.\d+)?)/);
        const value = numMatch ? parseFloat(numMatch[1]) : valRaw;
        
        return { attr, op, value };
      }
    }
    
    return null;
  }

  simulateClassification(node: any, values: { [key: string]: any }) {
    this.clearHighlights();
    const nodesVisited: any[] = [];
    let current = node;

    while (current) {
      nodesVisited.push(current);
      if (!current.children || current.children.length === 0) break;

      const condition = this.parseCondition(current.data.name);
      if (!condition) {
        this.showMessage("No se pudo interpretar: " + current.data.name);
        return;
      }

      const userVal = values[condition.attr];
      if (userVal === undefined) {
        this.showMessage("Falta atributo: " + condition.attr);
        return;
      }

      let decision = false;
      switch (condition.op) {
        case '>': decision = userVal > condition.value; break;
        case '<': decision = userVal < condition.value; break;
        case '==': decision = userVal == condition.value; break;
        case '!=': decision = userVal != condition.value; break;
        default:
          this.showMessage("Operador no soportado: " + condition.op);
          return;
      }

      current = decision ? current.children[0] : current.children[1];
    }

    nodesVisited.forEach((n: any) => {
      this.g.selectAll('g.node')
        .filter((d: any) => d.data.id === n.data.id)
        .classed('highlighted', true);
      if (n.parent) {
        this.g.selectAll('path.link')
          .filter((l: any) => l.source.data.id === n.parent.data.id && l.target.data.id === n.data.id)
          .classed('highlighted', true);
      }
    });

    if (current) this.showMessage("Clasificación: " + current.data.name);
  }

  runSimulation(input: string) {
    if (!input) return;
    const pairs = input.split(',').map(p => p.trim().split('='));
    const values: { [key: string]: any } = {};
    for (const [k, v] of pairs) {
      values[k.trim()] = isNaN(Number(v.trim())) ? v.trim() : Number(v.trim());
    }

    const syncedRoot = d3.hierarchy(this.treeData);
    this.simulateClassification(syncedRoot, values);
  }

  // Nuevos métodos para simulación interactiva
  updateSimulation() {
    // Ejecutar simulación automáticamente cuando cambian los valores
    if (this.isTreeLoaded) {
      this.runInteractiveSimulation();
    }
  }

  runInteractiveSimulation() {
    if (!this.isTreeLoaded) return;

    const values = {
      'Temperatura': this.temperatureValue,
      'Humedad': this.humidityValue,
      'Viento': this.windValue,
      'Precipitación': this.precipitationValue
    };

    const syncedRoot = d3.hierarchy(this.treeData);
    this.simulateInteractiveClassification(syncedRoot, values);
  }

  simulateInteractiveClassification(node: any, values: any) {
    // Limpiar resaltados anteriores
    this.clearHighlights();
    
    this.simulationPath = [];
    this.simulationNodeIds = [];
    this.decisionSteps = [];
    
    let current = node;
    while (current && current.children && current.children.length > 0) {
      this.simulationPath.push(current.data.name);
      this.simulationNodeIds.push(current.data.id);
      
      // Lógica de decisión y registrar el paso
      const decision = this.makeDecision(current.data.name, values);
      const decisionResult = decision === 1 ? 'Sí' : 'No';
      
      // Registrar el paso de decisión
      this.decisionSteps.push({
        condition: current.data.name,
        result: decisionResult
      });
      
      current = current.children[decision] || current.children[0];
    }

    if (current) {
      this.simulationPath.push(current.data.name);
      this.simulationNodeIds.push(current.data.id);
      this.simulationResult = current.data.name;
    }

    // Resaltar el camino en el árbol
    this.highlightPath();
  }

  makeDecision(nodeName: string, values: any): number {
    // Intentar parsear la condición del nodo
    const condition = this.parseCondition(nodeName);
    
    if (condition) {
      const userVal = values[condition.attr];
      if (userVal === undefined) {
        console.warn(`Atributo no encontrado: ${condition.attr}`);
        return 0;
      }
      
      // Evaluar la condición
      switch (condition.op) {
        case '>': return userVal > condition.value ? 1 : 0;
        case '<': return userVal < condition.value ? 1 : 0;
        case '>=': return userVal >= condition.value ? 1 : 0;
        case '<=': return userVal <= condition.value ? 1 : 0;
        case '==': return userVal == condition.value ? 1 : 0;
        case '!=': return userVal != condition.value ? 1 : 0;
        default: return 0;
      }
    }
    
    // Fallback a la lógica anterior si no se puede parsear
    if (nodeName.toLowerCase().includes('temperatura')) {
      return values.Temperatura > 25 ? 1 : 0;
    }
    if (nodeName.toLowerCase().includes('humedad')) {
      return values.Humedad > 60 ? 1 : 0;
    }
    if (nodeName.toLowerCase().includes('viento')) {
      return values.Viento === 'alto' ? 1 : 0;
    }
    if (nodeName.toLowerCase().includes('precipitación')) {
      return values.Precipitación !== 'ninguna' ? 1 : 0;
    }
    return 0;
  }

  highlightPath() {
    // Limpiar solo los números de secuencia anteriores
    if (this.g) {
      this.g.selectAll('.sequence-number').remove();
    }
    
    // Resaltar los nodos del camino con diferentes estilos
    this.simulationNodeIds.forEach((nodeId, index) => {
      const nodeElement = this.g.selectAll('g.node')
        .filter((d: any) => d.data.id === nodeId);
      
      if (index === this.simulationNodeIds.length - 1) {
        // Nodo final (resultado) - resaltado especial
        nodeElement.classed('path-result', true);
        
        // Aplicar estilos directamente también
        nodeElement.select('circle')
          .style('stroke', '#059669')
          .style('stroke-width', '4px')
          .style('fill', '#10b981')
          .style('filter', 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.5))');
        
        nodeElement.select('text')
          .style('fill', '#ffffff')
          .style('font-weight', '700');
      } else {
        // Nodos del camino - resaltado normal
        nodeElement.classed('path-node', true);
        
        // Aplicar estilos directamente también
        nodeElement.select('circle')
          .style('stroke', '#f59e0b')
          .style('stroke-width', '3px')
          .style('fill', '#fef3c7')
          .style('filter', 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))');
        
        nodeElement.select('text')
          .style('fill', '#92400e')
          .style('font-weight', '600');
      }
        
      // Resaltar la conexión al siguiente nodo
      if (index < this.simulationNodeIds.length - 1) {
        const nextNodeId = this.simulationNodeIds[index + 1];
        const linkElement = this.g.selectAll('path.link')
          .filter((l: any) => l.source.data.id === nodeId && l.target.data.id === nextNodeId);
        
        linkElement.classed('path-link', true);
        
        // Aplicar estilos directamente también
        linkElement
          .style('stroke', '#f59e0b')
          .style('stroke-width', '4px')
          .style('stroke-dasharray', '5,5');
      }
    });

    // Agregar números de secuencia a los nodos
    this.addSequenceNumbers();
  }

  addSequenceNumbers() {
    // Eliminar números anteriores
    this.g.selectAll('.sequence-number').remove();
    
    // Agregar números de secuencia a cada nodo del camino
    this.simulationNodeIds.forEach((nodeId, index) => {
      const nodeElement = this.g.selectAll('g.node')
        .filter((d: any) => d.data.id === nodeId);
      
      // Agregar círculo con número de secuencia
      nodeElement.append('circle')
        .attr('class', 'sequence-number')
        .attr('cx', 35)
        .attr('cy', -35)
        .attr('r', 12)
        .style('fill', '#f59e0b')
        .style('stroke', '#ffffff')
        .style('stroke-width', 2)
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
      
      // Agregar texto del número
      nodeElement.append('text')
        .attr('class', 'sequence-number')
        .attr('x', 35)
        .attr('y', -35)
        .attr('dy', '0.35em')
        .style('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('fill', '#ffffff')
        .style('pointer-events', 'none')
        .text(index + 1);
    });
  }

  getResultClass(result: string): string {
    // Retorna clases CSS basadas en el resultado
    if (result.toLowerCase().includes('si') || result.toLowerCase().includes('jugar')) {
      return 'result-positive';
    } else if (result.toLowerCase().includes('no') || result.toLowerCase().includes('no jugar')) {
      return 'result-negative';
    }
    return 'result-neutral';
  }

  loadDefaultTree() {
    // Cargar árbol por defecto
    this.treeData = {
      id: '1',
      name: 'Temperatura > 25°C?',
      type: 'root',
      children: [
        {
          id: '2',
          name: 'Humedad > 60%?',
          type: 'decision',
          children: [
            { id: '4', name: 'No Jugar', type: 'leaf' },
            { id: '5', name: 'Jugar', type: 'leaf' }
          ]
        },
        {
          id: '3',
          name: 'Viento fuerte?',
          type: 'decision',
          children: [
            { id: '6', name: 'Jugar', type: 'leaf' },
            { id: '7', name: 'No Jugar', type: 'leaf' }
          ]
        }
      ]
    };
    
    this.nodeCounter = 7;
    this.isTreeLoaded = true;
    
    // Ejecutar simulación inicial después de un pequeño delay
    setTimeout(() => {
      this.updateSimulation();
    }, 100);
  }

  loadExampleTree() {
    // Marcar que el árbol está cargado cuando se carga un ejemplo
    this.isTreeLoaded = true;
    
    // Lógica existente del loadExampleTree...
    this.treeData = {
      id: '1',
      name: 'Temperatura > 25°C?',
      type: 'root',
      children: [
        {
          id: '2',
          name: 'Humedad > 60%?',
          type: 'decision',
          children: [
            { id: '4', name: 'No Jugar', type: 'leaf' },
            { id: '5', name: 'Jugar', type: 'leaf' }
          ]
        },
        {
          id: '3',
          name: 'Viento fuerte?',
          type: 'decision',
          children: [
            { id: '6', name: 'Jugar', type: 'leaf' },
            { id: '7', name: 'No Jugar', type: 'leaf' }
          ]
        }
      ]
    };
    
    this.nodeCounter = 7;
    this.updateTree();
    this.showMessage('Árbol de ejemplo cargado. Ahora puedes usar la simulación interactiva.');
  }
}
