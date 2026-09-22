"""Importa produtos.xlsx ou produtos.csv para o catalogo local em script.js.

Uso:
  python tools/import-produtos.py produtos.xlsx
  python tools/import-produtos.py produtos.csv

A planilha deve ter uma linha de cabecalho. Os nomes aceitos incluem:
- nome / produto / descricao do produto
- categoria / tipo
- imagem / link da imagem / url da imagem
- descricao / detalhes
- preco / valor / preco de venda
- volume / tamanho
"""
from __future__ import annotations

import csv
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "script.js"

ALIASES = {
    "nome": {"nome", "produto", "descricao do produto", "nome do produto", "bebida"},
    "categoria": {"categoria", "categorias", "tipo", "tipo de produto"},
    "imagem": {"imagem", "imagem url", "url da imagem", "link da imagem", "foto", "foto url", "image", "image url"},
    "descricao": {"descricao", "descrição", "detalhes", "descricao do produto", "descrição do produto"},
    "preco": {"preco", "preço", "valor", "preco de venda", "preço de venda", "valor de venda"},
    "volume": {"volume", "tamanho", "ml", "litros", "conteudo", "conteúdo"},
}


def normalize(value: object) -> str:
    text = str(value or "").strip().lower()
    text = text.replace("á", "a").replace("à", "a").replace("ã", "a").replace("â", "a")
    text = text.replace("é", "e").replace("ê", "e").replace("í", "i").replace("ó", "o").replace("ô", "o").replace("õ", "o").replace("ú", "u").replace("ç", "c")
    return re.sub(r"\s+", " ", text)


def read_csv(path: Path) -> list[list[str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        sample = file.read(4096)
        file.seek(0)
        dialect = csv.Sniffer().sniff(sample, delimiters=";,\t,")
        return list(csv.reader(file, dialect))


def read_xlsx(path: Path) -> list[list[str]]:
    namespace = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main", "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
    package_namespace = "http://schemas.openxmlformats.org/package/2006/relationships"
    with zipfile.ZipFile(path) as archive:
        shared = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ElementTree.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in root.findall("main:si", namespace):
                shared.append("".join(node.text or "" for node in item.iterfind(".//main:t", namespace)))

        workbook = ElementTree.fromstring(archive.read("xl/workbook.xml"))
        first_sheet = workbook.find("main:sheets/main:sheet", namespace)
        relationship_id = first_sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
        relationships = ElementTree.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        target = next(item.attrib["Target"] for item in relationships if item.attrib["Id"] == relationship_id)
        sheet_path = "xl/" + target.lstrip("/") if not target.startswith("xl/") else target
        sheet = ElementTree.fromstring(archive.read(sheet_path))

        rows = []
        for row in sheet.findall(".//main:sheetData/main:row", namespace):
            values = []
            for cell in row.findall("main:c", namespace):
                value = cell.find("main:v", namespace)
                text = "" if value is None else value.text or ""
                if cell.attrib.get("t") == "s" and text:
                    text = shared[int(text)]
                values.append(text)
            rows.append(values)
        return rows


def read_rows(path: Path) -> list[list[str]]:
    if path.suffix.lower() == ".csv":
        return read_csv(path)
    if path.suffix.lower() in {".xlsx", ".xlsm"}:
        return read_xlsx(path)
    raise ValueError("Formato nao suportado. Use .xlsx, .xlsm ou .csv.")


def map_columns(headers: list[str]) -> dict[str, int]:
    normalized = [normalize(header) for header in headers]
    result = {}
    for field, aliases in ALIASES.items():
        for index, header in enumerate(normalized):
            if header in aliases or any(alias in header for alias in aliases if len(alias) > 4):
                result[field] = index
                break
    if "nome" not in result:
        raise ValueError("Nao encontrei uma coluna de nome/produto.")
    return result


def value(row: list[str], columns: dict[str, int], field: str) -> str:
    index = columns.get(field)
    return row[index].strip() if index is not None and index < len(row) else ""


def slugify(text: str) -> str:
    text = normalize(text)
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text or "produto"


def parse_price(text: str) -> float | None:
    if not text:
        return None
    cleaned = re.sub(r"[^0-9,.]", "", text)
    if "," in cleaned and "." in cleaned:
        cleaned = cleaned.replace(".", "").replace(",", ".")
    else:
        cleaned = cleaned.replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        return None


def load_existing(script: str) -> list[dict]:
    match = re.search(r"const produtos = (\[[\s\S]*?\n  \]);", script)
    if not match:
        raise ValueError("Nao encontrei o array const produtos em script.js.")
    # O catalogo atual usa apenas objetos literais simples; JSON5 nao e necessario aqui.
    source = match.group(1).replace("'", '"')
    source = re.sub(r",\s*([}\]])", r"\1", source)
    return json.loads(source)


def update_script(imported: list[dict]) -> int:
    script = SCRIPT.read_text(encoding="utf-8")
    existing = load_existing(script)
    by_id = {item["id"]: item for item in existing}
    added = 0
    for item in imported:
        if item["id"] not in by_id:
            by_id[item["id"]] = item
            added += 1
        else:
            by_id[item["id"]].update({key: value for key, value in item.items() if value not in ("", None)})

    catalog = json.dumps(list(by_id.values()), ensure_ascii=False, indent=2)
    catalog = "  " + catalog.replace("\n", "\n  ")
    updated = re.sub(r"const produtos = \[[\s\S]*?\n  \];", f"const produtos = {catalog};", script, count=1)
    SCRIPT.write_text(updated, encoding="utf-8")
    return added


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    source = Path(sys.argv[1]).resolve()
    if not source.exists():
        raise FileNotFoundError(f"Arquivo nao encontrado: {source}")
    rows = [row for row in read_rows(source) if any(str(cell).strip() for cell in row)]
    columns = map_columns(rows[0])
    products = []
    for row in rows[1:]:
        name = value(row, columns, "nome")
        if not name:
            continue
        category = normalize(value(row, columns, "categoria")) or "outros"
        image = value(row, columns, "imagem")
        volume = value(row, columns, "volume")
        description = value(row, columns, "descricao") or f"{name}{(' ' + volume) if volume else ''}."
        price = parse_price(value(row, columns, "preco"))
        product = {"id": slugify(name), "nome": name, "descricao": description, "categoria": category, "imagem": image}
        if volume and volume.lower() not in name.lower():
            product["nome"] += f" {volume}"
        if price is not None:
            product["preco"] = price
        products.append(product)

    added = update_script(products)
    print(f"Produtos lidos: {len(products)} | novos adicionados: {added} | catalogo: {SCRIPT}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"Erro: {error}", file=sys.stderr)
        raise SystemExit(1)
