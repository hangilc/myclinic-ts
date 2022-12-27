let nextBlockId = 1;

export enum BlockKind {
  Scan,
  Images,
}

export class Block {
  blockId: number;
  blockKind: BlockKind;
  constructor(blockKind: BlockKind) {
    this.blockId = nextBlockId++;
    this.blockKind = blockKind;
  }
}
