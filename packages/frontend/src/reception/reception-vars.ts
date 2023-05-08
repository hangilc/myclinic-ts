import { EventEmitter } from "@/lib/event-emitter";

export const hotlineTrigger: EventEmitter<string> = new EventEmitter<string>();
