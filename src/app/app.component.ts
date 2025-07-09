import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Machine Learning - Sistemas Inteligentes';

  ngOnInit() {
    // Configuración inicial
  }

  ngAfterViewInit() {
    this.initializeSidebar();
  }

  private initializeSidebar() {
    // Verificar que el documento esté disponible (para SSR)
    if (typeof document === 'undefined') return;
    
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    // Abrir sidebar
    if (sidebarToggle && sidebar && sidebarOverlay) {
      sidebarToggle.addEventListener('click', () => {
        this.openSidebar();
      });
    }

    // Cerrar sidebar con botón X
    if (sidebarClose) {
      sidebarClose.addEventListener('click', () => {
        this.closeSidebar();
      });
    }

    // Cerrar sidebar con overlay
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        this.closeSidebar();
      });
    }

    // Cerrar sidebar al hacer clic en un enlace
    sidebarLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeSidebar();
      });
    });

    // Cerrar sidebar con tecla Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeSidebar();
      }
    });
  }

  private openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    if (sidebar && sidebarOverlay && sidebarToggle) {
      sidebar.classList.add('active');
      sidebarOverlay.classList.add('active');
      sidebarToggle.classList.add('active');
      
      // Prevenir scroll del body cuando el sidebar está abierto
      document.body.style.overflow = 'hidden';
    }
  }

  private closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    if (sidebar && sidebarOverlay && sidebarToggle) {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      sidebarToggle.classList.remove('active');
      
      // Restaurar scroll del body
      document.body.style.overflow = 'auto';
    }
  }
}
