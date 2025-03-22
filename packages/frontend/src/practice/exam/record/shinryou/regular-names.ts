export type RegularName = string | {
	label: string;
	name: string;
}

export function getRegularNames(at: string): {
	left: RegularName[], right: RegularName[], bottom: RegularName[]
} {
	if (at >= "2025-01-01") {
		return names20250101;
	} else {
		return defaultNames;
	}
}

const names20250101 = {
	"left": [
		"初診",
		"再診",
		"医療情報取得加算（初診）",
		"医療情報取得加算（再診）",
		{ label: "医療ＤＸ推進２（初診）", name: "医療ＤＸ推進体制整備加算２（初診）" },
		"外来管理加算",
		"生活習慣病管理料２",
		{ label: "外来データ提出加算", name: "外来データ提出加算（生活習慣病管理料１・２）" },
		"特定疾患管理",
		"---",
		"尿便検査判断料",
		"血液検査判断料",
		"生化Ⅰ判断料",
		"生化Ⅱ判断料",
		"免疫検査判断料",
		"微生物検査判断料",
		"静脈採血"
	],
	"right": [
		"尿一般",
		"便潜血",
		"---",
		"処方箋料",
		"特定疾患処方管理加算（処方箋料）",
		"一般名処方加算２（処方箋料）",
		"一般名処方加算１（処方箋料）",
		"処方料",
		"処方料７",
		"特定疾患処方"
	],
	"bottom": [
		"心電図",
		"骨塩定量"
	]
};

const names20240601 = {
	"left": [
		"初診",
		"再診",
		"医療情報取得加算１（初診）",
		"医療情報取得加算２（初診）",
		"医療情報取得加算３（再診）",
		"医療情報取得加算４（再診）",
		"外来管理加算",
		"生活習慣病管理料２",
		"特定疾患管理",
		"---",
		"尿便検査判断料",
		"血液検査判断料",
		"生化Ⅰ判断料",
		"生化Ⅱ判断料",
		"免疫検査判断料",
		"微生物検査判断料",
		"静脈採血"
	],
	"right": [
		"尿一般",
		"便潜血",
		"---",
		"処方箋料",
		"特定疾患処方管理加算（処方箋料）",
		"一般名処方加算２（処方箋料）",
		"一般名処方加算１（処方箋料）",
		"処方料",
		"処方料７",
		"特定疾患処方"
	],
	"bottom": [
		"心電図",
		"骨塩定量"
	]
};

const defaultNames = {
	"left": [
		"初診",
		"再診",
		"外来管理加算",
		"特定疾患管理",
		"---",
		"尿便検査判断料",
		"血液検査判断料",
		"生化Ⅰ判断料",
		"生化Ⅱ判断料",
		"免疫検査判断料",
		"微生物検査判断料",
		"静脈採血"
	],
	"right": [
		"尿一般",
		"便潜血",
		"---",
		"処方箋料",
		"特定疾患処方管理加算２（処方箋料）",
		"一般名処方加算２（処方箋料）",
		"一般名処方加算１（処方箋料）",
		"処方料",
		"処方料７",
		"特定疾患処方"
	],
	"bottom": [
		"心電図",
		"骨塩定量"
	]
};
