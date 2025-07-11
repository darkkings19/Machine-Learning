import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as monaco from 'monaco-editor';

@Injectable({
  providedIn: 'root'
})
export class MonacoEditorService {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async initEditor(container: HTMLElement, initialCode: string = ''): Promise<monaco.editor.IStandaloneCodeEditor> {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Monaco Editor solo funciona en el navegador');
    }

    // Configurar la ruta base para Monaco Editor
    (window as any).MonacoEnvironment = {
      getWorkerUrl: () => 'assets/vs/base/worker/workerMain.js'
    };
    
    // Configurar Monaco Editor
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    
    // Crear el editor
    this.editor = monaco.editor.create(container, {
      value: initialCode,
      language: 'python',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: false,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      wordWrap: 'on',
      contextmenu: true,
      mouseWheelZoom: true,
      formatOnPaste: true,
      formatOnType: true,
      renderLineHighlight: 'line',
      selectOnLineNumbers: true,
      hideCursorInOverviewRuler: true,
      overviewRulerLanes: 3,
      overviewRulerBorder: false,
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: 'on',
      cursorStyle: 'line',
      disableLayerHinting: true,
      fixedOverflowWidgets: true,
      folding: true,
      foldingHighlight: true,
      links: true,
      matchBrackets: 'always',
      renderControlCharacters: false,
      renderValidationDecorations: 'editable',
      renderWhitespace: 'none',
      rulers: [],
      scrollbar: {
        verticalScrollbarSize: 14,
        horizontalScrollbarSize: 14,
        arrowSize: 11,
        useShadows: false,
        verticalHasArrows: false,
        horizontalHasArrows: false
      },
      smoothScrolling: true,
      suggestOnTriggerCharacters: true,
      wordBasedSuggestions: 'off',
      wordSeparators: '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?',
      wrappingIndent: 'indent',
      wrappingStrategy: 'advanced'
    });

    // Configurar autocompletado para Python
    this.setupPythonIntellisense();

    return this.editor;
  }

  private setupPythonIntellisense(): void {
    // Registrar proveedor de autocompletado para Python
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions: monaco.languages.CompletionItem[] = [
          // Sklearn
          {
            label: 'DecisionTreeClassifier',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'DecisionTreeClassifier()',
            documentation: 'Clasificador de árbol de decisión de sklearn',
            range: range
          },
          {
            label: 'fit',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'fit(X, y)',
            documentation: 'Entrenar el modelo',
            range: range
          },
          {
            label: 'predict',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'predict(X)',
            documentation: 'Realizar predicciones',
            range: range
          },
          {
            label: 'accuracy_score',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'accuracy_score(y_true, y_pred)',
            documentation: 'Calcular precisión del modelo',
            range: range
          },
          // Pandas
          {
            label: 'DataFrame',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'DataFrame()',
            documentation: 'Estructura de datos de pandas',
            range: range
          },
          {
            label: 'read_csv',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'read_csv("filename")',
            documentation: 'Leer archivo CSV',
            range: range
          },
          // Matplotlib
          {
            label: 'pyplot',
            kind: monaco.languages.CompletionItemKind.Module,
            insertText: 'pyplot',
            documentation: 'Módulo de gráficos de matplotlib',
            range: range
          },
          {
            label: 'plot',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'plot(x, y)',
            documentation: 'Crear gráfico de líneas',
            range: range
          },
          // Numpy
          {
            label: 'array',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'array(data)',
            documentation: 'Crear array de numpy',
            range: range
          }
        ];

        return { suggestions };
      }
    });
  }

  getValue(): string {
    return this.editor?.getValue() || '';
  }

  setValue(value: string): void {
    this.editor?.setValue(value);
  }

  dispose(): void {
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
  }

  getEditor(): monaco.editor.IStandaloneCodeEditor | null {
    return this.editor;
  }

  insertCode(code: string): void {
    if (this.editor) {
      const position = this.editor.getPosition();
      if (position) {
        this.editor.executeEdits('', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: code
        }]);
      }
    }
  }

  formatCode(): void {
    if (this.editor) {
      this.editor.getAction('editor.action.formatDocument')?.run();
    }
  }
}
