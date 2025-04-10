class EventManager {
  constructor() {
    this.eventListeners = [];
  }

  addEventListenerWithTracking(element, event, handler) {
    this.eventListeners.push({ element, event, handler });
  }

  removeAllEventListeners() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners.length = 0;
  }
}

export const eventManager = new EventManager();
