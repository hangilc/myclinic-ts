export let isAdmin: boolean = false;

export function setIsAdmin(value: boolean): void {
  isAdmin = value;
}

export let appointTimeTemplate: {
  kind: string,
  capacity: number
} = {
  kind: "regular",
  capacity: 1
};
