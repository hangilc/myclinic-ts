export type Closer = () => void;

export interface Opener {
  open(): Closer
}
