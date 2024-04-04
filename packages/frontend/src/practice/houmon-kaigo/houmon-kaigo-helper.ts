

export function parseDataSource(src: string): {
  data: Record<string, string>;
  errors: string[]
} {
  const data: Record<string, string> = {};
  const errors: string[] = [];
  const seps: string[] = [":::", "|", "：", ":"];
  src.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (line === "") {
      return;
    }
    let key: string = "";
    let value: string = "";
    for (let sep of seps) {
      const parts = splitWith(line, sep);
      if (parts) {
        key = parts.key;
        value = parts.value;
        break;
      }
    }
    if (key === "") {
      errors.push(`Invalid line (separate with ${seps}): ${line}`);
    } else {
      data[key] = value;
    }
  })
  return { data, errors };
}

function splitWith(line: string, sep: string): { key: string, value: string } | undefined {
  const parts = line.split(sep);
  if (parts.length === 2) {
    return {
      key: parts[0].trim(),
      value: parts[1].trim(),
    }
  } else {
    return undefined;
  }
}