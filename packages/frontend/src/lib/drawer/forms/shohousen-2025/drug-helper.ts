import type { Drug, Senpatsu, Shohou, Usage } from "@/lib/parse-shohou";

type ShohouData = {
  groups: ShohouGroup[];
  shohouComments: string[];
}

type ShohouGroup = {
  drugs: ShohouDrug[];
  usage: string;
  groupComments: string[];
}

type ShohouDrug = {
  text: string;
  senpatsu?: Senpatsu;
  drugComments: string[];
}

function handleShohou(shohou: Shohou): {
  shohouData: ShohouData;
  bikou: string[];
  kigen: string;
} {
  const shohouData: ShohouData = { groups: [], 
    shohouComments: [] 
  };
  function handleDrug(src: Drug): ShohouDrug {
    const text = drugNameAndAmountLine(src);
    const senpatsu = src.senpatsu;
    const drugComments = src.drugComments;
    return { text, senpatsu, drugComments };
  }
  shohou.groups.forEach(srcGroup => {
    const dstGroup: ShohouGroup = {
      drugs: srcGroup.drugs.map(handleDrug),
      usage: drugUsageLine(srcGroup.usage),
      groupComments: srcGroup.groupComments,
    };
    shohouData.groups.push(dstGroup);
  });
  shohouData.shohouComments = shohou.comments ?? [];
  let bikou = shohou.bikou;
  let kigen = shohou.kigen ?? "";
  shohouData.shohouComments = shohou.comments ?? [];
  return { shohouData, bikou, kigen, };
}

function drugNameAndAmountLine(drug: Drug): string {
  return `${drug.name}　${drug.amount}${drug.unit}`
}

function drugUsageLine(usage: Usage): string {
  switch (usage.kind) {
    case "days": {
      return `${usage.usage}　${usage.days}日分`;
    }
    case "times": {
      return `${usage.usage}　${usage.times}回分`;
    }
    case "other": {
      return `${usage.usage}`;
    }
  }
}

