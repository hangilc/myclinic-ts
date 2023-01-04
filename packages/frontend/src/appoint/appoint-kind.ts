export class AppointKind {
  constructor(
    public code: string,
    public label: string,
    public ord: number,
    public iconColor: string
  ) {}
}

const map: Record<string, AppointKind> = { };

function add(ak: AppointKind): void {
  map[ak.code] = ak;
}

add(new AppointKind("regular", "", 0, "green"))
add(new AppointKind("covid-vac", "コロナワクチン", 1, "purple"))
add(new AppointKind("flu-vac", "インフルワクチン", 2, "yellow"))
add(new AppointKind("covid-vac-pfizer", "コロナワクチン（ファイザー）", 3, "lightblue"))
add(new AppointKind("covid-vac-pfizer-om", "コロナワクチン（ファイザー、オミクロン）", 4, "lightblue"))
add(new AppointKind("covid-vac-moderna", "コロナワクチン（モデルナ）", 5, "orange"))

export function resolveAppointKind(code: string): AppointKind | undefined {
  return map[code];
}