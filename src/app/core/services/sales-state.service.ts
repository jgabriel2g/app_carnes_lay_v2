import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client } from '../models/client.model';
import { PaymentMethod } from '../models/global.model';

interface ProductSelected {
  productId: string;
  productName: string;
  amount: number | null;
  price: number;
  type_of_unit_measurement: string;
}

export interface ActiveSale {
  date: string;
  client: Client | null;
  payment_method: PaymentMethod | null;
  total_received: number;
  products: ProductSelected[];
  sale: number;
  bill: any;
  isFinalized: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SalesStateService {
  private getCurrentDate(): string {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  // Initialize with empty sales session
  private initialSale: ActiveSale = {
    date: this.getCurrentDate(),
    client: null,
    payment_method: null,
    total_received: 0,
    products: [],
    sale: 0,
    isFinalized: false,
    bill: null,
  };

  // Store all sales sessions
  private salesSessionsSubject = new BehaviorSubject<ActiveSale[]>([
    this.initialSale,
  ]);
  salesSessions$ = this.salesSessionsSubject.asObservable();

  // Store the currently selected session
  private selectedSessionSubject = new BehaviorSubject<ActiveSale>(
    this.initialSale
  );
  selectedSession$ = this.selectedSessionSubject.asObservable();

  constructor() {
    // Load from localStorage on initialization
    this.loadFromStorage();
  }

  // Get the current sales sessions
  get salesSessions(): ActiveSale[] {
    return this.salesSessionsSubject.value;
  }

  // Get the currently selected sales session
  get selectedSession(): ActiveSale {
    return this.selectedSessionSubject.value;
  }

  // Update the currently selected session
  setSelectedSession(session: ActiveSale): void {
    this.selectedSessionSubject.next(session);
    this.saveToStorage();
  }

  // Add a new sales session
  addSalesSession(session: ActiveSale): void {
    const currentSessions = this.salesSessionsSubject.value;
    this.salesSessionsSubject.next([...currentSessions, session]);
    this.setSelectedSession(session);
    this.saveToStorage();
  }

  // Update a specific sales session
  updateSalesSession(updatedSession: ActiveSale): void {
    console.log('🔄 Actualizando sesión de ventas');
    console.log('Productos en sesión actualizada:', updatedSession.products);

    try {
      // Crear una copia profunda para evitar problemas de referencia
      const updatedSessionCopy = JSON.parse(JSON.stringify(updatedSession));

      // Obtener las sesiones actuales
      const currentSessions = [...this.salesSessionsSubject.value];

      // Encontrar el índice de la sesión seleccionada en el array
      const currentIndex = currentSessions.findIndex((session) =>
        this.isSameSession(session, this.selectedSession)
      );

      if (currentIndex === -1) {
        console.error(
          '❌ No se encontró la sesión actual en la lista de sesiones'
        );
        return;
      }

      // Actualizar la sesión en el array
      currentSessions[currentIndex] = updatedSessionCopy;

      // Actualizar el estado
      this.salesSessionsSubject.next(currentSessions);
      this.selectedSessionSubject.next(updatedSessionCopy);

      // Guardar en localStorage
      this.saveToStorage();

      console.log('✅ Actualización completada');
      console.log('Sesión actualizada:', this.selectedSessionSubject.value);
      console.log(
        'Productos en la sesión:',
        this.selectedSessionSubject.value.products
      );
    } catch (error) {
      console.error('❌ Error al actualizar la sesión:', error);
    }
  }

  // Helper para comparar si dos sesiones son la misma
  private isSameSession(session1: ActiveSale, session2: ActiveSale): boolean {
    // Podemos usar varias propiedades para identificar la misma sesión
    // Si alguna de estas es undefined, fallback a una comparación menos estricta
    return (
      // Si hay ID, comparar por ID
      (session1.sale && session2.sale && session1.sale === session2.sale) ||
      // De lo contrario, comparar otras propiedades
      (session1.date === session2.date &&
        session1.isFinalized === session2.isFinalized &&
        session1.client === session2.client)
    );
  }

  // Remove a sales session
  removeSalesSession(index: number): void {
    const currentSessions = this.salesSessionsSubject.value;
    const removedSession = currentSessions[index];
    const newSessions = [...currentSessions];
    newSessions.splice(index, 1);

    if (newSessions.length === 0) {
      this.resetSessions();
      return;
    }

    this.salesSessionsSubject.next(newSessions);

    // If we removed the currently selected session, select another one
    if (this.selectedSession === removedSession) {
      this.selectedSessionSubject.next(newSessions[newSessions.length - 1]);
    }

    this.saveToStorage();
  }

  // Reset to initial state
  resetSessions(): void {
    const initialState = [this.initialSale];
    this.salesSessionsSubject.next(initialState);
    this.selectedSessionSubject.next(this.initialSale);
    this.saveToStorage();
  }

  // Clear a specific session and reset it
  clearSession(session: ActiveSale): void {
    const newSession: ActiveSale = {
      date: this.getCurrentDate(),
      client: null,
      payment_method: session.payment_method, // Keep the payment method
      total_received: 0,
      products: [],
      sale: 0,
      isFinalized: false,
      bill: null,
    };

    this.updateSalesSession(newSession);
    // Verificar que la actualización se realizó correctamente
    setTimeout(() => {
      if (this.selectedSession.isFinalized) {
        console.warn(
          'La sesión no se limpió correctamente, intentando de nuevo...'
        );
        this.updateSalesSession(newSession);
      }
    }, 100);
  }

  // Save state to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem('salesSessions', JSON.stringify(this.salesSessions));
      localStorage.setItem(
        'selectedSessionIndex',
        JSON.stringify(this.salesSessions.indexOf(this.selectedSession))
      );
    } catch (error) {
      console.error('Error saving sales sessions to localStorage:', error);
    }
  }

  // Load state from localStorage
  private loadFromStorage(): void {
    try {
      const savedSessions = localStorage.getItem('salesSessions');
      const savedSelectedIndex = localStorage.getItem('selectedSessionIndex');

      if (savedSessions) {
        const sessions = JSON.parse(savedSessions) as ActiveSale[];
        this.salesSessionsSubject.next(sessions);

        if (savedSelectedIndex) {
          const index = JSON.parse(savedSelectedIndex);
          if (index >= 0 && index < sessions.length) {
            this.selectedSessionSubject.next(sessions[index]);
          } else if (sessions.length > 0) {
            this.selectedSessionSubject.next(sessions[0]);
          }
        } else if (sessions.length > 0) {
          this.selectedSessionSubject.next(sessions[0]);
        }
      }
    } catch (error) {
      console.error('Error loading sales sessions from localStorage:', error);
      this.resetSessions();
    }
  }
}
