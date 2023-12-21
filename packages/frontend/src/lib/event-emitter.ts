export type Subscriber<T> = (event: T) => void;
export type Unsubscriber = () => void;

export class EventEmitter<T> {
  subscribers: Subscriber<T>[] = [];

  subscribe(subscriber: Subscriber<T>): Unsubscriber {
    this.subscribers.push(subscriber);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== subscriber);
    };
  }

  emit(value: T): void {
    this.subscribers.forEach(s => {
      try {
        s(value);
      } catch (ex: any) {
        console.log(ex.toString());
      }
    })
  }
}

export const hotlineTrigger = new EventEmitter<string>;
