// El backend maneja LocalDateTime tipo "2026-08-15T14:30:00".
// Los inputs type="datetime-local" usan "2026-08-15T14:30" (sin segundos).
export function toInputDateTime(isoString) {
  if (!isoString) return "";
  return isoString.slice(0, 16);
}

export function toApiDateTime(inputValue) {
  if (!inputValue) return null;
  return inputValue.length === 16 ? `${inputValue}:00` : inputValue;
}
