#!/usr/bin/env python3
"""Build Northern Ready2Work's static O*NET 31.0 occupation + alternate-title index.

Source: U.S. Department of Labor / O*NET 31.0 Database, CC BY 4.0.
https://www.onetcenter.org/database.html
No API credentials, participant data, or browser-side third-party calls required.
"""
import csv
import io
import json
import os
import urllib.request
from pathlib import Path

BASE = "https://www.onetcenter.org/dl_files/database/db_31_0_csv/"
OUT = Path("site/preview-v2/ready2work/onet-occupation-catalog-v31.json")


def get_rows(filename):
    url = BASE + filename
    request = urllib.request.Request(url, headers={"User-Agent": "Northern-BOOST-Occupation-Catalog/1.0"})
    with urllib.request.urlopen(request, timeout=65) as response:
        body = response.read().decode("utf-8-sig")
    return list(csv.DictReader(io.StringIO(body)))


def build(occupations, job_titles):
    result = []
    valid_codes = set()
    for row in occupations:
        code = (row.get("O*NET-SOC Code") or "").strip()
        title = (row.get("Title") or "").strip()
        if not code or not title or code in valid_codes:
            continue
        valid_codes.add(code)
        result.append([code, title, (row.get("Description") or "").strip()])
    if len(result) < 950:
        raise RuntimeError(f"Expected full O*NET occupation catalog; received only {len(result)}")
    aliases = set()
    for row in job_titles:
        code = (row.get("O*NET-SOC Code") or "").strip()
        if code not in valid_codes:
            continue
        for title in ((row.get("Alternate Title") or "").strip(), (row.get("Short Title") or "").strip()):
            if title:
                aliases.add((title, code))
    if len(aliases) < 20000:
        raise RuntimeError(f"Expected O*NET alternate job titles; received only {len(aliases)}")
    return {
        "version": "31.0",
        "source": "O*NET 31.0 Database, U.S. Department of Labor, CC BY 4.0",
        "sourceUrl": "https://www.onetcenter.org/database.html",
        "occupations": sorted(result, key=lambda r: r[1].casefold()),
        "jobTitles": sorted([list(x) for x in aliases], key=lambda r: (r[0].casefold(), r[1])),
    }


def main():
    data = build(get_rows("occupation_data.csv"), get_rows("alternate_titles.csv"))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"O*NET {data['version']}: {len(data['occupations'])} occupations, {len(data['jobTitles'])} alternate job titles; {OUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
