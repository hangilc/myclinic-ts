export interface WorkareaService {
  destroy: () => void;
  confirmClear: () => Promise<boolean>;
}