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
