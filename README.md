##  Guía para clonar y ejecutar el proyecto (Windows / Linux / macOS)


###  1. Instalar Node.js

#### Windows:

1. Descarga Node.js desde: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
2. Ejecuta el instalador y sigue los pasos por defecto.

#### Linux (Debian/Ubuntu):

```bash
sudo apt update
sudo apt install nodejs npm
```

> Nota: En algunas distribuciones puede que necesites instalar `nodejs-legacy` o actualizar a una versión más reciente usando repositorios externos.

#### macOS (con Homebrew):

```bash
brew install node
```

---

###  2. Instalar Git

#### Windows:

1. Descarga Git desde: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Ejecuta el instalador y sigue los pasos por defecto.

#### Linux (Debian/Ubuntu):

```bash
sudo apt update
sudo apt install git
```

#### macOS (con Homebrew):

```bash
brew install git
```

---

###  3. Clonar el repositorio

Abre una terminal o consola y ejecuta:

```bash
git clone https://github.com/camilo09m/Machine-Learning
```

---

###  4. Dirigirse a la carpeta del proyecto

```bash
cd Machine-Learning
```


---

###  5. Abrir la terminal en la carpeta del proyecto

* Windows:
  Haz clic derecho dentro de la carpeta y selecciona:
  "Abrir en Terminal" o "Git Bash Here".

* Linux/macOS:
  Haz clic derecho sobre la carpeta y selecciona:
  "Abrir en una terminal" (según el entorno de escritorio).

---

###  6. Instalar dependencias del proyecto

Dentro de la terminal ubicada en la carpeta del proyecto, ejecuta:

```bash
npm install
```

---

###  7. Instalar Angular CLI globalmente (solo la primera vez)

Para poder usar el comando `ng`, instala Angular CLI globalmente:

```bash
npm install -g @angular/cli
```

---

###  8. Ejecutar el servidor de desarrollo

Inicia el proyecto con:

```bash
ng serve
```

Una vez cargado, abre tu navegador y visita:

 [http://localhost:4200](http://localhost:4200)


## Referencias Y Links Para Profundizar En Machine Learning
1. [Web Assembly](https://dev.to/railsstudent/angular-on-steroids-elevating-performance-with-webassembly-43gb)
2. [Machine Learning](https://www.sap.com/latinamerica/products/artificial-intelligence/what-is-machine-learning.html)
3. [Machine Learning: Mitchell, T. M. (1997). Machine learning. McGraw-Hill.]
4. [Arbol de Decisiones](https://scielo.pt/scielo.php?pid=S1646-98952023000300084&script=sci_arttext&tlng=es)
5. [Arbol de Decisiones: Gómez, C. A. R. (2020). Aplicación del Machine Learning en agricultura de precisión. Revista Cintex, 25(2), 14-27.]
6. [Aprendizaje por Refuerzo](https://www.ibm.com/es-es/think/topics/reinforcement-learning)
7. [Aprendizaje por Refuerzo: Errecalde, M. L. (2001). Marcos teóricos del aprendizaje por refuerzo multiagente. In III Workshop de Investigadores en Ciencias de la Computación.]
