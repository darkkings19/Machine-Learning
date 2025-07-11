import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PyodideService } from '../../services/pyodide.service';
import { MonacoEditorService } from '../../services/monaco-editor.service';
import * as monaco from 'monaco-editor';

@Component({
  selector: 'app-ejemplo-arbol',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ejemplo.component.html',
  styleUrl: './ejemplo.component.css'
})
export class EjemploArbolComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef<HTMLDivElement>;
  
  // Estado del playground
  isReady = false;
  isLoading = true;
  isExecuting = false;
  statusText = 'Inicializando...';
  
  // Resultados
  hasResults = false;
  hasError = false;
  executionOutput = '';
  executionError = '';
  
  // Editor
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  
  // Ejemplos de código
  private examples = {
    basic: `# Árbol de Decisión Básico con Dataset Iris
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

# Cargar el dataset Iris
iris = load_iris()
X = iris.data  # características: largo/ancho del sépalo y pétalo
y = iris.target  # clases: 0=setosa, 1=versicolor, 2=virginica

print("Dataset Iris cargado:")
print(f"Número de muestras: {len(X)}")
print(f"Número de características: {len(X[0])}")
print(f"Clases: {iris.target_names}")

# Dividir en conjunto de entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# Crear y entrenar el árbol de decisión
tree = DecisionTreeClassifier(
    criterion='gini',
    max_depth=3,
    random_state=42
)
tree.fit(X_train, y_train)

# Hacer predicciones
y_pred = tree.predict(X_test)

# Evaluar el modelo
accuracy = accuracy_score(y_test, y_pred)
print(f"\\nPrecisión del modelo: {accuracy:.2f}")
print(f"Profundidad del árbol: {tree.get_depth()}")
print(f"Número de nodos: {tree.tree_.node_count}")

# Ejemplo de predicción con nueva flor
nueva_flor = [[5.1, 3.5, 1.4, 0.2]]  # características de una flor
prediccion = tree.predict(nueva_flor)
probabilidad = tree.predict_proba(nueva_flor)[0]

print(f"\\nPredicción para nueva flor:")
print(f"Clase predicha: {iris.target_names[prediccion[0]]}")
print(f"Probabilidades: {dict(zip(iris.target_names, probabilidad))}")`,

    advanced: `# Análisis Avanzado del Árbol de Decisión
import numpy as np
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, confusion_matrix

# Cargar datos
iris = load_iris()
X, y = iris.data, iris.target

# Dividir datos
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# Crear árbol con diferentes parámetros
tree = DecisionTreeClassifier(
    criterion='gini',
    max_depth=4,
    min_samples_split=10,
    min_samples_leaf=5,
    random_state=42
)

# Entrenar
tree.fit(X_train, y_train)

# Predicciones
y_pred = tree.predict(X_test)

# Análisis de resultados
accuracy = accuracy_score(y_test, y_pred)
print(f"Precisión: {accuracy:.3f}")

# Importancia de características
importances = tree.feature_importances_
feature_names = iris.feature_names

print("\\nImportancia de características:")
for name, importance in zip(feature_names, importances):
    print(f"{name}: {importance:.3f}")

# Matriz de confusión
cm = confusion_matrix(y_test, y_pred)
print("\\nMatriz de confusión:")
print(cm)

# Estadísticas del árbol
print(f"\\nEstadísticas del árbol:")
print(f"Profundidad: {tree.get_depth()}")
print(f"Número de nodos: {tree.tree_.node_count}")
print(f"Número de hojas: {tree.get_n_leaves()}")

# Reglas del árbol (simplificadas)
print("\\nAlgunas reglas del árbol:")
print("Si petal length <= 2.5 -> Setosa")
print("Si petal length > 2.5 y petal width <= 1.65 -> Versicolor")
print("Si petal length > 2.5 y petal width > 1.65 -> Virginica")`,

    comparison: `# Comparación de Algoritmos de Clasificación
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score
import numpy as np

# Cargar datos
iris = load_iris()
X, y = iris.data, iris.target

# Dividir datos
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# Definir modelos
models = {
    'Árbol de Decisión': DecisionTreeClassifier(random_state=42),
    'KNN': KNeighborsClassifier(n_neighbors=3),
    'SVM': SVC(random_state=42),
    'Naive Bayes': GaussianNB()
}

print("Comparación de algoritmos de clasificación:")
print("=" * 50)

results = {}
for name, model in models.items():
    # Entrenamiento
    model.fit(X_train, y_train)
    
    # Predicciones
    y_pred = model.predict(X_test)
    
    # Evaluación
    accuracy = accuracy_score(y_test, y_pred)
    
    # Validación cruzada
    cv_scores = cross_val_score(model, X, y, cv=5)
    cv_mean = cv_scores.mean()
    cv_std = cv_scores.std()
    
    results[name] = {
        'accuracy': accuracy,
        'cv_mean': cv_mean,
        'cv_std': cv_std
    }
    
    print(f"\\n{name}:")
    print(f"  Precisión en test: {accuracy:.3f}")
    print(f"  Validación cruzada: {cv_mean:.3f} ± {cv_std:.3f}")

# Resumen
print("\\n" + "=" * 50)
print("RESUMEN:")
best_model = max(results.items(), key=lambda x: x[1]['cv_mean'])
print(f"Mejor modelo: {best_model[0]}")
print(f"Precisión: {best_model[1]['cv_mean']:.3f}")

# Ventajas del árbol de decisión
print("\\n🌳 Ventajas del Árbol de Decisión:")
print("• Fácil interpretación y visualización")
print("• No requiere escalado de características")
print("• Maneja variables categóricas naturalmente")
print("• Puede capturar relaciones no lineales")
print("• Selección automática de características")`
  };

  constructor(
    private pyodideService: PyodideService,
    private monacoService: MonacoEditorService
  ) {}

  async ngOnInit() {
    this.statusText = 'Cargando WebAssembly...';
    try {
      await this.pyodideService.init();
      this.statusText = 'Listo para ejecutar código';
      this.isReady = true;
      this.isLoading = false;
    } catch (error) {
      this.statusText = 'Error al cargar WebAssembly';
      this.isLoading = false;
      console.error('Error inicializando Pyodide:', error);
    }
  }

  async ngAfterViewInit() {
    if (this.editorContainer) {
      try {
        this.editor = await this.monacoService.initEditor(
          this.editorContainer.nativeElement,
          this.examples.basic
        );
      } catch (error) {
        console.error('Error inicializando Monaco Editor:', error);
      }
    }
  }

  ngOnDestroy() {
    if (this.editor) {
      this.monacoService.dispose();
    }
  }

  async runCode() {
    if (!this.isReady || this.isExecuting) return;
    
    const code = this.monacoService.getValue();
    if (!code.trim()) {
      this.showError('No hay código para ejecutar');
      return;
    }

    this.isExecuting = true;
    this.hasResults = false;
    this.hasError = false;
    this.executionOutput = '';
    this.executionError = '';

    try {
      const result = await this.pyodideService.runCode(code);
      
      if (result.error) {
        this.showError(result.error);
        this.executionOutput = result.output;
      } else {
        this.showSuccess(result.output);
      }
    } catch (error: any) {
      this.showError(error.message || 'Error desconocido');
    } finally {
      this.isExecuting = false;
    }
  }

  private showSuccess(output: string) {
    this.executionOutput = output || 'Código ejecutado exitosamente (sin salida)';
    this.hasResults = true;
    this.hasError = false;
  }

  private showError(error: string) {
    this.executionError = error;
    this.hasResults = true;
    this.hasError = true;
  }

  loadExample(type: string = 'basic') {
    if (!this.isReady) return;
    
    const exampleCode = this.examples[type as keyof typeof this.examples];
    if (exampleCode) {
      this.monacoService.setValue(exampleCode);
      this.clearResults();
    }
  }

  clearEditor() {
    if (!this.isReady) return;
    this.monacoService.setValue('');
    this.clearResults();
  }

  formatCode() {
    if (!this.isReady) return;
    this.monacoService.formatCode();
  }

  clearResults() {
    this.hasResults = false;
    this.hasError = false;
    this.executionOutput = '';
    this.executionError = '';
  }
}
