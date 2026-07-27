"use client";

import { useMemo, useState } from "react";
import { importZunanjaUsposabljanjaAction } from "@/app/(admin)/admin/uvoz/actions";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Heading2, Heading3, Text, TextMedium } from "@/components/ui/Typography";
import { parseZunanjaUsposabljanja } from "@/lib/zunanja-usposabljanja-parse";

const PLACEHOLDER = `Janez Novak 041 706 530 "Sobota, 25.04.2026, od 08:00 do 14:00, RU 2024, Ljubljanska cesta 30, 4000 Kranj" 041 706 530 janez.novak@example.com`;

export function UvozZgodovinePageContent() {
  const [raw, setRaw] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number } | { error: string } | null>(null);

  const { rows, errors } = useMemo(() => parseZunanjaUsposabljanja(raw), [raw]);

  const handleImport = async () => {
    if (rows.length === 0) return;
    setIsImporting(true);
    setResult(null);
    const outcome = await importZunanjaUsposabljanjaAction(rows);
    setIsImporting(false);
    setResult(outcome);
    if (!("error" in outcome)) setRaw("");
  };

  return (
    <div>
      <Heading2>Uvoz preteklih usposabljanj</Heading2>
      <Text className="mt-4 max-w-2xl">
        Za voznike, ki so posamezna predavanja Kode 95 opravili pri drugem izvajalcu, prilepi
        seznam spodaj — ena vrstica na predavanje, v obliki: ime priimek, telefon, citiran opis
        termina (dan, datum, čas, program »RU«/»ZU«/»Tema« z letom modula, naslov), telefon,
        e-pošta. Ker EMŠO ni na voljo, se vrstice istega voznika povežejo prek telefonske
        številke.
      </Text>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <Heading3>Prilepi seznam</Heading3>
          <Box className="mt-4 bg-white">
            <textarea
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              placeholder={PLACEHOLDER}
              rows={14}
              className="w-full resize-y rounded border border-divider bg-secondary-bg px-[14px] py-[10px] font-mono text-[13px] text-paragraph placeholder-placeholder focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
          </Box>
          <Button
            type="button"
            variant="primary"
            className="mt-4"
            disabled={rows.length === 0 || isImporting}
            onClick={handleImport}
          >
            {isImporting ? "Uvažam …" : `Uvozi (${rows.length})`}
          </Button>
          {result ? (
            "error" in result ? (
              <Text className="mt-4 text-red-600">{result.error}</Text>
            ) : (
              <Text className="mt-4 text-secondary-dark">
                Uvoženih {result.imported} {result.imported === 1 ? "zapis" : "zapisov"}.
              </Text>
            )
          ) : null}
        </div>

        <div>
          <Heading3>Predogled ({rows.length})</Heading3>
          <Box className="mt-4 bg-white">
            {rows.length === 0 && errors.length === 0 ? (
              <Text className="text-placeholder">Ni vrstic za predogled.</Text>
            ) : (
              <div className="flex flex-col gap-3">
                {rows.map((row, index) => (
                  <div
                    key={index}
                    className={index < rows.length - 1 ? "border-b border-divider pb-3" : ""}
                  >
                    <TextMedium className="text-[14px]">{row.fullName}</TextMedium>
                    <Text className="text-[13px] text-placeholder">
                      {row.program === "redna-koda-95" ? "Redna" : "Začetna"}
                      {row.modul ? ` · Modul ${row.modul}` : ""} · {row.date}
                      {row.phone ? ` · ${row.phone}` : ""}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </Box>
          {errors.length > 0 ? (
            <Box className="mt-4 bg-[#FFF4F4]">
              <Heading3 className="text-red-600">Napake</Heading3>
              <div className="mt-2 flex flex-col gap-1">
                {errors.map((error, index) => (
                  <Text key={index} className="text-[13px] text-red-600">
                    Vrstica {error.line}: {error.message}
                  </Text>
                ))}
              </div>
            </Box>
          ) : null}
        </div>
      </div>
    </div>
  );
}
