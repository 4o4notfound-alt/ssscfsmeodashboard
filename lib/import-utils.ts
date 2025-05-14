/**
 * Utility functions for importing data from different formats
 */

/**
 * Parse CSV string into an array of objects
 */
export function parseCSV(csvString: string): any[] {
  // Split the CSV into lines
  const lines = csvString.split(/\r?\n/).filter((line) => line.trim() !== "")
  if (lines.length === 0) {
    throw new Error("CSV file is empty")
  }

  // Parse the header row
  const headers = parseCSVLine(lines[0])

  // Parse data rows
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length !== headers.length) {
      console.warn(`Line ${i + 1} has ${values.length} values, expected ${headers.length}`)
      continue
    }

    const row: Record<string, any> = {}
    for (let j = 0; j < headers.length; j++) {
      // Try to convert to number if possible
      const value = values[j]
      row[headers[j]] = isNumeric(value) ? Number.parseFloat(value) : value
    }
    data.push(row)
  }

  return data
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      // Handle quotes
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Double quotes inside quotes - add a single quote
        current += '"'
        i++
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current)
      current = ""
    } else {
      // Add character to current field
      current += char
    }
  }

  // Add the last field
  result.push(current)
  return result
}

/**
 * Check if a string can be converted to a number
 */
function isNumeric(value: string): boolean {
  return !isNaN(Number.parseFloat(value)) && isFinite(Number(value))
}

/**
 * Convert nested object structure to flat structure with dot notation
 */
export function flattenObject(obj: any, prefix = ""): Record<string, any> {
  const result: Record<string, any> = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      const newKey = prefix ? `${prefix}.${key}` : key

      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(result, flattenObject(value, newKey))
      } else {
        result[newKey] = value
      }
    }
  }

  return result
}

/**
 * Convert flat structure with dot notation to nested object structure
 */
export function unflattenObject(obj: Record<string, any>): any {
  const result: any = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      const parts = key.split(".")
      let current = result

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        if (!current[part]) {
          current[part] = {}
        }
        current = current[part]
      }

      current[parts[parts.length - 1]] = value
    }
  }

  return result
}
