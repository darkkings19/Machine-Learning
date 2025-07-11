import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { loadPyodide, PyodideInterface } from 'pyodide';

@Injectable({
  providedIn: 'root'
})
export class PyodideService {
  private pyodide: PyodideInterface | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Pyodide solo funciona en el navegador');
    }

    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.loadPyodide();
    return this.initPromise;
  }

  private async loadPyodide(): Promise<void> {
    try {
      console.log('🐍 Cargando Pyodide...');
      this.pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      });
      
      // Instalar paquetes necesarios para ML
      await this.pyodide.loadPackage(['numpy', 'matplotlib', 'scikit-learn', 'pandas']);
      
      console.log('✅ Pyodide cargado exitosamente');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Error cargando Pyodide:', error);
      throw error;
    }
  }

  async runCode(code: string): Promise<{ output: string; error?: string }> {
    if (!this.pyodide) {
      throw new Error('Pyodide no está inicializado');
    }

    try {
      // Capturar stdout
      let output = '';
      
      // Configurar redirección de stdout
      this.pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);

      // Ejecutar código del usuario
      const result = this.pyodide.runPython(code);
      
      // Obtener la salida
      const stdout = this.pyodide.runPython('sys.stdout.getvalue()');
      const stderr = this.pyodide.runPython('sys.stderr.getvalue()');
      
      // Restaurar stdout
      this.pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
      `);

      output = stdout || (result !== undefined ? String(result) : '');
      
      if (stderr) {
        return { output, error: stderr };
      }
      
      return { output };
    } catch (error: any) {
      return { 
        output: '', 
        error: error.message || 'Error desconocido en la ejecución' 
      };
    }
  }

  async installPackage(packageName: string): Promise<void> {
    if (!this.pyodide) {
      throw new Error('Pyodide no está inicializado');
    }
    
    try {
      await this.pyodide.loadPackage([packageName]);
      console.log(`✅ Paquete ${packageName} instalado`);
    } catch (error) {
      console.error(`❌ Error instalando paquete ${packageName}:`, error);
      throw error;
    }
  }

  getAvailablePackages(): string[] {
    return [
      'numpy',
      'pandas',
      'matplotlib',
      'scikit-learn',
      'scipy',
      'sympy',
      'micropip'
    ];
  }

  isReady(): boolean {
    return this.isInitialized && this.pyodide !== null;
  }
}
