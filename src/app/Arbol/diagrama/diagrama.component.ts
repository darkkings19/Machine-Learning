import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var d3: any;

interface TreeNode {
  id: string;
  name: string;
  type: 'root' | 'decision' | 'leaf';
  children?: TreeNode[];
  parent?: TreeNode;
  x?: number;
  y?: number;
}

@Component({
  selector: 'app-diagrama-arbol',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './diagrama.component.html',
  styleUrl: './diagrama.component.css'
})
export class DiagramaArbolComponent implements OnInit, AfterViewInit {
  @ViewChild('treeContainer', { static: false }) treeContainer!: ElementRef;

  // Estado del árbol
  treeData: TreeNode = {
    id: '1',
    name: 'Nodo Raíz',
    type: 'root',
    children: []
  };

  selectedNode: TreeNode | null = null;
  nodeCounter = 1;
  
  // Estado de edición
  isEditing = false;
  editingText = '';

  // Variables D3
  svg: any;
  g: any;
  width = 1200;
  height = 800;
  
  ngOnInit() {}

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
  }

  private updateTree() {
    const treeLayout = d3.tree().size([this.height - 200, this.width - 200]);
    const root = d3.hierarchy(this.treeData);
    treeLayout(root);

    // Limpiar elementos anteriores
    this.g.selectAll(".link").remove();
    this.g.selectAll(".node").remove();

    // Crear enlaces
    const links = this.g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x))
      .style("fill", "none")
      .style("stroke", "#cbd5e0")
      .style("stroke-width", 2);

    // Crear nodos
    const nodes = this.g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
      .style("cursor", "pointer");

    // Círculos de nodos (más grandes)
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

    // Rectángulo de fondo para el texto
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

    // Texto de nodos mejorado
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

    // Tooltip para mostrar el nombre completo
    nodes.append("title")
      .text((d: any) => `${d.data.name}\nTipo: ${d.data.type}\nID: ${d.data.id}`);

    // Event listeners para interactividad
    nodes.on("click", (event: any, d: any) => {
      event.stopPropagation();
      this.selectNode(d.data);
    });

    nodes.on("dblclick", (event: any, d: any) => {
      event.stopPropagation();
      this.startEditing(d.data);
    });

    // Click en el fondo para deseleccionar
    this.svg.on("click", () => {
      this.selectedNode = null;
      this.updateTree();
    });
  }

  selectNode(node: TreeNode) {
    this.selectedNode = node;
    this.updateTree();
  }

  startEditing(node: TreeNode) {
    this.isEditing = true;
    this.editingText = node.name;
    this.selectedNode = node;
  }

  finishEditing() {
    if (this.selectedNode && this.editingText.trim()) {
      this.selectedNode.name = this.editingText.trim();
      this.updateTree();
    }
    this.isEditing = false;
    this.editingText = '';
  }

  cancelEditing() {
    this.isEditing = false;
    this.editingText = '';
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

    // Encontrar el nodo padre y eliminar el nodo actual
    this.removeNodeFromTree(this.treeData, this.selectedNode.id);
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
    
    // Si es hoja, eliminar hijos
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

  loadExampleTree() {
    this.treeData = {
      id: '1',
      name: 'Temperatura > 25°C?',
      type: 'root',
      children: [
        {
          id: '2',
          name: 'Humedad > 70%?',
          type: 'decision',
          children: [
            {
              id: '4',
              name: 'No realizar actividad',
              type: 'leaf',
              children: []
            },
            {
              id: '5',
              name: 'Realizar actividad',
              type: 'leaf',
              children: []
            }
          ]
        },
        {
          id: '3',
          name: 'Viento fuerte?',
          type: 'decision',
          children: [
            {
              id: '6',
              name: 'No realizar actividad',
              type: 'leaf',
              children: []
            },
            {
              id: '7',
              name: 'Realizar actividad',
              type: 'leaf',
              children: []
            }
          ]
        }
      ]
    };
    this.nodeCounter = 7;
    this.selectedNode = null;
    this.updateTree();
  }
}
