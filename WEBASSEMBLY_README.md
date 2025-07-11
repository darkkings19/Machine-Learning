# Código Python Ejecutable en el Navegador

## 🚀 Funcionalidad WebAssembly

Este componente permite ejecutar código Python directamente en el navegador usando **Pyodide** y **WebAssembly**.

## ✨ Características

- **Ejecución local**: Todo el código se ejecuta en tu navegador, no se envía a ningún servidor
- **Privacidad**: Tus datos permanecen en tu dispositivo
- **Velocidad**: WebAssembly permite ejecución a velocidad casi nativa
- **Librerías completas**: Incluye scikit-learn, numpy, pandas y otras librerías científicas

## 🛠️ Implementación técnica

### Arquitectura Angular + Pyodide
- **Componente TypeScript**: Maneja la lógica de ejecución de Python
- **ViewChild**: Referencias a elementos DOM de manera segura
- **Lifecycle hooks**: Inicialización correcta con ngOnInit y ngAfterViewInit
- **Event binding**: Uso de `(click)` en lugar de `onclick` para compatibilidad con Angular

### Flujo de ejecución
1. **Inicialización**: El componente carga el script de Pyodide
2. **Primer clic**: Descarga e inicializa Pyodide con las librerías necesarias
3. **Ejecución**: Captura stdout y ejecuta el código Python
4. **Resultado**: Muestra la salida en el elemento de salida

## 🛠️ Cómo funciona

1. **Pyodide**: Porta Python y el ecosistema científico al navegador
2. **WebAssembly**: Compila el código Python a WebAssembly para mayor velocidad
3. **Carga automática**: Las librerías se cargan automáticamente cuando ejecutas el código por primera vez

## 📦 Librerías incluidas

- `scikit-learn`: Machine learning
- `numpy`: Computación numérica
- `pandas`: Análisis de datos
- Dataset Iris integrado

## 🔧 Uso

1. Haz clic en el botón **"🚀 Ejecutar Código Python"**
2. Espera a que se cargue Pyodide (solo la primera vez)
3. Ve los resultados en tiempo real

## ⚠️ Notas importantes

- **Primera ejecución**: Puede tomar 10-30 segundos cargar todas las librerías
- **Conexión**: Necesitas conexión a internet para la primera carga
- **Navegador**: Compatible con navegadores modernos que soporten WebAssembly

## 🎯 Ejemplo de salida

```
Precisión del modelo: 1.00
Tipo de flor predicha: setosa

--- Información adicional ---
Tamaño del dataset: 150 flores
Características por flor: 4
Clases: ['setosa' 'versicolor' 'virginica']
Flores de entrenamiento: 105
Flores de prueba: 45
```

## 🔍 Solución de problemas

### Error: "runPythonCode is not defined"
Este error se ha solucionado moviendo la lógica JavaScript al componente Angular:
- ✅ **Solucionado**: La función ahora está en el componente TypeScript
- ✅ **Compatibilidad**: Funciona con Angular SSR e hidratación
- ✅ **Mejores prácticas**: Usa ViewChild y referencias de Angular

### Otros problemas comunes:
Si encuentras errores:
1. Verifica tu conexión a internet
2. Recarga la página e intenta nuevamente
3. Asegúrate de que tu navegador soporte WebAssembly

## � Diseño profesional

### Inspiración universitaria
El diseño está inspirado en sistemas educativos universitarios profesionales:
- **Paleta de colores**: Azules profesionales (#175CFF, #1950D1)
- **Tipografía**: Inter y Sora (fuentes del sistema de la UFRO)
- **Componentes**: Cards, botones y tabs con sombras sutiles
- **Espaciado**: Sistema de espaciado consistente
- **Animaciones**: Transiciones suaves con cubic-bezier

### Elementos visuales
- **Gradientes**: Degradados profesionales en botones y títulos
- **Sombras**: Sistema de sombras profesional
- **Iconografía**: SVG vectoriales escalables
- **Responsive**: Diseño adaptable a todos los dispositivos

## �🌟 Tecnologías utilizadas

- **Angular**: Framework frontend
- **Pyodide**: Python en el navegador
- **WebAssembly**: Ejecución de alto rendimiento
- **Scikit-learn**: Machine learning
- **CSS Grid/Flexbox**: Layout moderno
- **CSS Custom Properties**: Variables CSS profesionales
