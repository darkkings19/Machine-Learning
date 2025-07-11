import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PythonRunnerComponent } from '../../python-runner/python-runner.component';

@Component({
  selector: 'app-dt-code-example',
  standalone: true,
  imports: [CommonModule, PythonRunnerComponent],
  templateUrl: './dt-code-example.html',
  styleUrl: './dt-code-example.css'
})
export class DtCodeExampleComponent {
  
  decisionTreeCode = `# Árboles de Decisión - Clasificación de Flores Iris
# Este ejemplo muestra cómo usar árboles de decisión para clasificar flores

import numpy as np
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

print("🌸 Ejemplo de Árboles de Decisión - Dataset Iris")
print("=" * 50)

# 1. Cargar el dataset Iris
print("📊 Cargando dataset de flores Iris...")
iris = load_iris()
X = iris.data  # Características: largo/ancho sépalo y pétalo
y = iris.target  # Clases: 0=Setosa, 1=Versicolor, 2=Virginica

print(f"Dataset cargado: {X.shape[0]} flores con {X.shape[1]} características")
print(f"Características: {iris.feature_names}")
print(f"Clases: {iris.target_names}")

# 2. Mostrar algunas muestras
print("\\n🔍 Primeras 5 flores del dataset:")
for i in range(5):
    print(f"Flor {i+1}: {X[i]} -> {iris.target_names[y[i]]}")

# 3. Dividir datos en entrenamiento y prueba
print("\\n📈 Dividiendo datos en entrenamiento (80%) y prueba (20%)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"Datos de entrenamiento: {X_train.shape[0]} flores")
print(f"Datos de prueba: {X_test.shape[0]} flores")

# 4. Crear y entrenar el árbol de decisión
print("\\n🌳 Creando y entrenando el Árbol de Decisión...")
clf = DecisionTreeClassifier(
    max_depth=3,  # Profundidad máxima del árbol
    random_state=42,
    criterion='gini'  # Criterio para medir la calidad de las divisiones
)

# Entrenar el modelo
clf.fit(X_train, y_train)
print("✅ Árbol entrenado exitosamente!")

# 5. Hacer predicciones
print("\\n🎯 Haciendo predicciones en datos de prueba...")
y_pred = clf.predict(X_test)

# 6. Evaluar el modelo
accuracy = accuracy_score(y_test, y_pred)
print(f"\\n📊 Precisión del modelo: {accuracy:.2%}")

# Mostrar predicciones vs realidad
print("\\n🔍 Comparación de predicciones:")
print("Real -> Predicción")
for i in range(min(10, len(y_test))):
    real = iris.target_names[y_test[i]]
    pred = iris.target_names[y_pred[i]]
    status = "✅" if y_test[i] == y_pred[i] else "❌"
    print(f"{real:12} -> {pred:12} {status}")

# 7. Importancia de las características
print("\\n📈 Importancia de las características:")
feature_importance = clf.feature_importances_
for i, importance in enumerate(feature_importance):
    print(f"{iris.feature_names[i]:20}: {importance:.3f}")

# 8. Predecir una nueva flor
print("\\n🌺 Prediciendo una nueva flor con características:")
new_flower = [[5.1, 3.5, 1.4, 0.2]]  # Características de una nueva flor
print(f"Largo sépalo: {new_flower[0][0]} cm")
print(f"Ancho sépalo: {new_flower[0][1]} cm") 
print(f"Largo pétalo: {new_flower[0][2]} cm")
print(f"Ancho pétalo: {new_flower[0][3]} cm")

prediction = clf.predict(new_flower)
probability = clf.predict_proba(new_flower)

print(f"\\n🎯 Predicción: {iris.target_names[prediction[0]]}")
print("🔢 Probabilidades:")
for i, prob in enumerate(probability[0]):
    print(f"  {iris.target_names[i]:12}: {prob:.2%}")

print("\\n🧠 ¿Cómo funciona el árbol de decisión?")
print("El árbol hace preguntas sobre las características de la flor:")
print("- ¿El ancho del pétalo es <= 0.8? -> Si: Setosa")
print("- ¿El ancho del pétalo es <= 1.75? -> Si: Versicolor, No: Virginica")
print("Y así sucesivamente hasta clasificar la flor.")

print("\\n✨ ¡Clasificación completada con Árboles de Decisión!")`;

}
