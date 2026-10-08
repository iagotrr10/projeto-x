"""Importa produtos de .tsv, .csv, .xlsx ou .xlsm para o catalogo em script.js.

Uso (a partir da raiz do projeto):
    python tools/import-produtos.py produtos.xlsx
    python tools/import-produtos.py tools/cervejas-pao-de-acucar.tsv
    python tools/import-produtos.py produtos.csv --dry-run

Com cabecalho, aceita nome/produto, categoria/tipo, imagem/url da imagem,
descricao, preco/valor, volume e id. Sem cabecalho, usa a ordem id, nome,
imagem, categoria e preco. Um backup e criado antes de gravar.
"""
from __future__ import annotations

import csv
import json
import posixpath
import re
import shutil
import sys
import unicodedata
import zipfile
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "script.js"
CATEGORIAS = {"cervejas", "refrigerantes", "sucos", "energeticos", "destilados", "vinhos"}
POSITIONAL = {"id": 0, "nome": 1, "imagem": 2, "categoria": 3, "preco": 4}
KEY_ORDER = ["id", "nome", "descricao", "categoria", "preco", "precoAntigo", "imagem"]

ALIASES = {
    "id": {"id", "codigo", "slug"},
    "nome": {"nome", "produto", "nome do produto", "bebida", "descricao do produto"},
    "categoria": {"categoria", "categorias", "tipo", "tipo de produto"},
    "imagem": {"imagem", "imagem url", "url da imagem", "link da imagem", "foto", "foto url", "image", "image url"},
    "descricao": {"descricao", "detalhes"},
    "preco": {"preco", "valor", "preco de venda", "valor de venda"},
    "volume": {"volume", "tamanho", "ml", "litros", "conteudo"},
}


def normalize(value: object) -> str:
    text = unicodedata.normalize("NFD", str(value or "").strip().lower())
    text = "".join(char for char in text if unicodedata.category(char) != "Mn")
    return re.sub(r"\s+", " ", text)


def read_delimited(path: Path) -> list[list[str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        if path.suffix.lower() == ".tsv":
            return list(csv.reader(file, delimiter="\t"))
        sample = file.read(4096)
        file.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=";,\t")
        except csv.Error:
            dialect = csv.excel
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
        if first_sheet is None:
            raise ValueError("A planilha nao contem abas.")
        relationship_id = first_sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
        relationships = ElementTree.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        target = next(item.attrib["Target"] for item in relationships if item.attrib["Id"] == relationship_id)
        sheet_path = target.lstrip("/") if target.startswith("/") else posixpath.normpath(posixpath.join("xl", target))
        sheet = ElementTree.fromstring(archive.read(sheet_path))

        rows = []
        for row in sheet.findall(".//main:sheetData/main:row", namespace):
            values = []
            for cell in row.findall("main:c", namespace):
                column = re.match(r"[A-Z]+", cell.attrib.get("r", ""))
                column_index = 0
                if column:
                    for letter in column.group(0):
                        column_index = column_index * 26 + ord(letter) - 64
                    while len(values) < column_index - 1:
                        values.append("")
                value = cell.find("main:v", namespace)
                text = "" if value is None else value.text or ""
                if cell.attrib.get("t") == "s" and text:
                    text = shared[int(text)]
                elif cell.attrib.get("t") == "inlineStr":
                    text = "".join(node.text or "" for node in cell.iterfind(".//main:t", namespace))
                values.append(text)
            rows.append(values)
        return rows


def read_rows(path: Path) -> list[list[str]]:
    if path.suffix.lower() in {".csv", ".tsv"}:
        return read_delimited(path)
    if path.suffix.lower() in {".xlsx", ".xlsm"}:
        return read_xlsx(path)
    raise ValueError("Formato nao suportado. Use .tsv, .csv, .xlsx ou .xlsm.")


def map_columns(first_row: list[str]) -> tuple[dict[str, int], bool]:
    normalized = [normalize(header) for header in first_row]
    result: dict[str, int] = {}
    for field, aliases in ALIASES.items():
        for index, header in enumerate(normalized):
            if index not in result.values() and header in aliases:
                result[field] = index
                break
    if "nome" not in result:
        return dict(POSITIONAL), False
    return result, True


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


def js_literal_to_json(source: str) -> str:
    """Converte objetos JS simples do catalogo em JSON para leitura local."""
    token = re.compile(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|([A-Za-z_$][\w$]*)(?=\s*:)|,(?=\s*[}\]])')

    def replace(match: re.Match) -> str:
        text = match.group(0)
        if match.group(1):
            return f'"{match.group(1)}"'
        if text == ",":
            return ""
        if text.startswith("'"):
            return json.dumps(text[1:-1].replace("\\'", "'"), ensure_ascii=False)
        return text

    return token.sub(replace, source)


CATALOG = re.compile(r"(const produtos = \[\n)([\s\S]*?)(\n  \];)")


def load_catalog(script: str) -> tuple[list[dict], re.Match]:
    match = CATALOG.search(script)
    if not match:
        raise ValueError("Nao encontrei o array 'const produtos' em script.js.")
    return json.loads("[" + js_literal_to_json(match.group(2)) + "]"), match


def format_product(product: dict) -> str:
    keys = [key for key in KEY_ORDER if key in product] + [key for key in product if key not in KEY_ORDER]
    fields = []
    for key in keys:
        value = product[key]
        literal = f"{value:.2f}" if isinstance(value, float) else json.dumps(value, ensure_ascii=False)
        fields.append(f"{key}: {literal}")
    return "    { " + ", ".join(fields) + " }"


def build_products(rows: list[list[str]]) -> list[dict]:
    columns, has_header = map_columns(rows[0])
    products = []
    for row in rows[1:] if has_header else rows:
        name = value(row, columns, "nome")
        if not name:
            continue
        volume = value(row, columns, "volume")
        if volume and volume.lower() not in name.lower():
            name = f"{name} {volume}"
        category = normalize(value(row, columns, "categoria"))
        if category not in CATEGORIAS:
            if category:
                print(f"Aviso: categoria desconhecida '{category}' em '{name}' (usando 'outros').", file=sys.stderr)
            category = "outros"
        product = {
            "id": value(row, columns, "id") or slugify(name),
            "nome": name,
            "descricao": value(row, columns, "descricao"),
            "categoria": category,
            "imagem": value(row, columns, "imagem"),
        }
        price = parse_price(value(row, columns, "preco"))
        if price is not None:
            product["preco"] = price
        products.append(product)
    return products


def merge(existing: list[dict], imported: list[dict]) -> tuple[list[dict], int, int]:
    by_id = {product["id"]: product for product in existing}
    added = updated = 0
    for imported_product in imported:
        product = {key: value for key, value in imported_product.items() if value not in ("", None)}
        current = by_id.get(product["id"])
        if current is None:
            product.setdefault("descricao", product["nome"] + ".")
            product.setdefault("preco", 0)
            by_id[product["id"]] = product
            added += 1
            continue
        if product.get("imagem", "").startswith("http") and current.get("imagem"):
            product.pop("imagem")
        current.update(product)
        updated += 1
    return list(by_id.values()), added, updated


def main(argv: list[str]) -> int:
    arguments = [argument for argument in argv if not argument.startswith("--")]
    dry_run = "--dry-run" in argv
    if len(arguments) != 1:
        print(__doc__)
        return 2
    source = Path(arguments[0]).resolve()
    if not source.exists():
        raise FileNotFoundError(f"Arquivo nao encontrado: {source}")
    rows = [row for row in read_rows(source) if any(str(cell).strip() for cell in row)]
    if not rows:
        raise ValueError("A planilha esta vazia.")

    script = SCRIPT.read_text(encoding="utf-8")
    existing, match = load_catalog(script)
    imported = build_products(rows)
    catalog, added, updated = merge(existing, imported)
    print(f"Lidos: {len(imported)} | novos: {added} | atualizados: {updated} | total: {len(catalog)}")
    if dry_run:
        print("Modo --dry-run: nada foi gravado.")
        return 0

    shutil.copyfile(SCRIPT, SCRIPT.with_suffix(".js.bak"))
    body = ",\n".join(format_product(product) for product in catalog)
    SCRIPT.write_text(script[:match.start(2)] + body + script[match.end(2):], encoding="utf-8")
    print(f"Catalogo atualizado em {SCRIPT} (backup: {SCRIPT.with_suffix('.js.bak')})")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv[1:]))
    except Exception as error:
        print(f"Erro: {error}", file=sys.stderr)
        raise SystemExit(1)
