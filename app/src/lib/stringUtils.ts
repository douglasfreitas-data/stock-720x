/**
 * Utilitários para manipulação de strings.
 */

/**
 * Normaliza uma string de busca removendo acentos, diacríticos e 
 * quaisquer caracteres não alfanuméricos (mantém apenas letras, números e espaços).
 * Ideal para ser usada tanto no texto buscado quanto no valor a qual ele é comparado.
 * 
 * Ex: "Açúcar Mascavo" -> "acucar mascavo"
 * Ex: "Cabo USB-C" -> "cabo usbc"
 */
export function normalizeSearchString(str: string | null | undefined): string {
    if (!str) return '';
    return str
        .toLowerCase()
        // Remove acentos e diacríticos decompondo-os (NFD) e removendo
        // os "combining characters" do Unicode
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")
        // Remove tudo que não for letra ou número ou espaço
        .replace(/[^a-z0-9\s]/g, "")
        // Reduz múltiplos espaços para um só
        .replace(/\s+/g, " ")
        .trim();
}
