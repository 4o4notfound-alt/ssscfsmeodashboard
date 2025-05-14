"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileJson, FileSpreadsheet, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { mockOuraData } from "@/lib/mock-data"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { parseCSV } from "@/lib/import-utils"

// Define the expected data structure
type HealthData = {
  date: string
  sleep: {
    score: number
    duration: number
    deep: number
    rem: number
    light: number
    hrv: number
    restingHeartRate: number
  }
  activity: {
    score: number
    steps: number
    calories: number
    activeCalories: number
    distance: number
  }
  readiness: {
    score: number
    hrv: number
    restingHeartRate: number
    bodyTemperature: number
    recoveryIndex: number
  }
}

interface DataImportProps {
  onDataImported: (data: HealthData[]) => void
}

export function DataImport({ onDataImported }: DataImportProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [importMethod, setImportMethod] = useState<"file" | "demo">("file")
  const [showMappingDialog, setShowMappingDialog] = useState(false)
  const [uploadedData, setUploadedData] = useState<any[] | null>(null)
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({})
  const [availableFields, setAvailableFields] = useState<string[]>([])
  const [requiredFields] = useState<string[]>([
    "date",
    "sleep.score",
    "sleep.duration",
    "sleep.deep",
    "sleep.rem",
    "sleep.light",
    "sleep.hrv",
    "sleep.restingHeartRate",
    "activity.score",
    "activity.steps",
    "activity.calories",
    "activity.activeCalories",
    "activity.distance",
    "readiness.score",
    "readiness.hrv",
    "readiness.restingHeartRate",
    "readiness.bodyTemperature",
    "readiness.recoveryIndex",
  ])
  const [autoDetectFields, setAutoDetectFields] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    try {
      let parsedData: any[] = []

      // Parse based on file type
      if (file.name.endsWith(".csv")) {
        const text = await file.text()
        parsedData = parseCSV(text)
      } else if (file.name.endsWith(".json")) {
        const text = await file.text()
        parsedData = JSON.parse(text)
      } else if (file.name.endsWith(".ts") || file.name.endsWith(".js")) {
        const text = await file.text()

        try {
          // Extract array data from TS/JS file
          const dataMatch = text.match(/(?:export\s+const\s+\w+\s*=\s*|\[\s*)([\s\S]*?)(?:\s*\]\s*;?\s*$|$)/)

          if (dataMatch && dataMatch[1]) {
            // Process the string to make it valid JSON
            let jsonString =
              "[" +
              dataMatch[1]
                .replace(/\/\/.*$/gm, "") // Remove single-line comments
                .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
                .replace(/(\w+):/g, '"$1":') // Convert property names to strings
                .replace(/'/g, '"') // Replace single quotes with double quotes
                .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
                .trim()

            // Ensure the string ends with a closing bracket
            if (!jsonString.endsWith("]")) {
              jsonString += "]"
            }

            parsedData = JSON.parse(jsonString)
          } else {
            throw new Error("Could not extract data array from file")
          }
        } catch (evalError) {
          console.error("Error parsing TS/JS file:", evalError)
          throw new Error("Could not parse the TypeScript/JavaScript file")
        }
      } else {
        throw new Error("Unsupported file format")
      }

      if (!Array.isArray(parsedData)) {
        // Try to find an array in the object
        const possibleArrays = Object.values(parsedData).filter((val) => Array.isArray(val))
        if (possibleArrays.length > 0) {
          parsedData = possibleArrays[0] as any[]
        } else {
          throw new Error("No array data found in the file")
        }
      }

      // Check if data matches expected structure
      if (validateData(parsedData)) {
        // Data is valid, import directly
        onDataImported(parsedData)
        toast({
          title: "Data imported successfully",
          description: `${parsedData.length} records imported from ${file.name}`,
        })
      } else {
        // Data needs mapping
        setUploadedData(parsedData)
        analyzeDataStructure(parsedData)
        setShowMappingDialog(true)
      }
    } catch (error) {
      console.error("Error parsing file:", error)
      toast({
        variant: "destructive",
        title: "Error importing data",
        description: `${error instanceof Error ? error.message : "Unknown error"}. Please check the file format.`,
      })
    }
  }

  // Validate if data matches expected structure
  const validateData = (data: any[]): data is HealthData[] => {
    if (!Array.isArray(data) || data.length === 0) return false

    // Check first item structure
    const item = data[0]

    return (
      item &&
      typeof item === "object" &&
      typeof item.date === "string" &&
      item.sleep &&
      typeof item.sleep === "object" &&
      typeof item.sleep.score === "number" &&
      typeof item.sleep.duration === "number" &&
      typeof item.sleep.deep === "number" &&
      typeof item.sleep.rem === "number" &&
      typeof item.sleep.light === "number" &&
      typeof item.sleep.hrv === "number" &&
      typeof item.sleep.restingHeartRate === "number" &&
      item.activity &&
      typeof item.activity === "object" &&
      typeof item.activity.score === "number" &&
      typeof item.activity.steps === "number" &&
      typeof item.activity.calories === "number" &&
      typeof item.activity.activeCalories === "number" &&
      typeof item.activity.distance === "number" &&
      item.readiness &&
      typeof item.readiness === "object" &&
      typeof item.readiness.score === "number" &&
      typeof item.readiness.hrv === "number" &&
      typeof item.readiness.restingHeartRate === "number" &&
      typeof item.readiness.bodyTemperature === "number" &&
      typeof item.readiness.recoveryIndex === "number"
    )
  }

  // Analyze data structure to find potential field mappings
  const analyzeDataStructure = (data: any[]) => {
    if (!data.length) return

    // Get all available fields from the first item
    const firstItem = data[0]
    const fields: string[] = []

    const extractFields = (obj: any, prefix = "") => {
      if (!obj || typeof obj !== "object") return

      Object.keys(obj).forEach((key) => {
        const fullPath = prefix ? `${prefix}.${key}` : key

        if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
          extractFields(obj[key], fullPath)
        } else {
          fields.push(fullPath)
        }
      })
    }

    extractFields(firstItem)
    setAvailableFields(fields)

    // Auto-detect mappings if enabled
    if (autoDetectFields) {
      const mappings: Record<string, string> = {}

      // Try exact matches first
      requiredFields.forEach((required) => {
        if (fields.includes(required)) {
          mappings[required] = required
        }
      })

      // Try fuzzy matches for remaining fields
      requiredFields.forEach((required) => {
        if (mappings[required]) return // Skip if already mapped

        // Split the required field path
        const parts = required.split(".")
        const fieldName = parts[parts.length - 1].toLowerCase()

        // Look for fields with similar names
        const match = fields.find((f) => {
          const fParts = f.split(".")
          const fName = fParts[fParts.length - 1].toLowerCase()
          return fName === fieldName || fName.includes(fieldName) || fieldName.includes(fName)
        })

        if (match) {
          mappings[required] = match
        }
      })

      setMappedFields(mappings)
    }
  }

  // Apply mappings to transform data
  const applyMappings = () => {
    if (!uploadedData) return

    try {
      const transformedData: HealthData[] = uploadedData.map((item) => {
        const newItem: any = {
          date: "",
          sleep: {
            score: 0,
            duration: 0,
            deep: 0,
            rem: 0,
            light: 0,
            hrv: 0,
            restingHeartRate: 0,
          },
          activity: {
            score: 0,
            steps: 0,
            calories: 0,
            activeCalories: 0,
            distance: 0,
          },
          readiness: {
            score: 0,
            hrv: 0,
            restingHeartRate: 0,
            bodyTemperature: 0,
            recoveryIndex: 0,
          },
        }

        // Apply each mapping
        Object.entries(mappedFields).forEach(([targetField, sourceField]) => {
          if (!sourceField) return

          // Get value from source field
          const getValue = (obj: any, path: string) => {
            const parts = path.split(".")
            let value = obj

            for (const part of parts) {
              if (value === undefined || value === null) return undefined
              value = value[part]
            }

            return value
          }

          // Set value in target field
          const setValue = (obj: any, path: string, value: any) => {
            const parts = path.split(".")
            let current = obj

            for (let i = 0; i < parts.length - 1; i++) {
              const part = parts[i]
              if (!current[part]) current[part] = {}
              current = current[part]
            }

            const lastPart = parts[parts.length - 1]

            // Convert value to number if needed
            if (typeof current[lastPart] === "number" && typeof value !== "number") {
              const num = Number.parseFloat(value)
              current[lastPart] = isNaN(num) ? 0 : num
            } else {
              current[lastPart] = value
            }
          }

          const value = getValue(item, sourceField)
          if (value !== undefined) {
            setValue(newItem, targetField, value)
          }
        })

        return newItem
      })

      // Validate transformed data
      if (validateData(transformedData)) {
        onDataImported(transformedData)
        setShowMappingDialog(false)
        toast({
          title: "Data imported successfully",
          description: `${transformedData.length} records imported and mapped to the correct format`,
        })
      } else {
        throw new Error("Data mapping failed. Some required fields are missing or invalid.")
      }
    } catch (error) {
      console.error("Error applying mappings:", error)
      toast({
        variant: "destructive",
        title: "Mapping failed",
        description: `${error instanceof Error ? error.message : "Unknown error"}. Please check your field mappings.`,
      })
    }
  }

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const file = event.dataTransfer.files?.[0]
    if (file) {
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        fileInputRef.current.files = dataTransfer.files

        const changeEvent = new Event("change", { bubbles: true })
        fileInputRef.current.dispatchEvent(changeEvent)
      }
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  // Clear file selection
  const clearFile = () => {
    setFileName(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Use demo data
  const handleUseDemo = () => {
    onDataImported(mockOuraData)
    setImportMethod("demo")
    toast({
      title: "Demo data loaded",
      description: "Using sample health data for demonstration",
    })
  }

  // Update field mapping
  const updateMapping = (targetField: string, sourceField: string) => {
    setMappedFields((prev) => ({
      ...prev,
      [targetField]: sourceField,
    }))
  }

  // Get field display name
  const getFieldDisplayName = (field: string) => {
    return field
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, " $1"))
      .join(" › ")
  }

  // Check if all required fields are mapped
  const allRequiredFieldsMapped = () => {
    return requiredFields.every((field) => mappedFields[field])
  }

  return (
    <>
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle>Import Health Data</CardTitle>
          <CardDescription>Upload your health data file or use demo data</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={importMethod} onValueChange={(value) => setImportMethod(value as "file" | "demo")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="file">Upload File</TabsTrigger>
              <TabsTrigger value="demo">Use Demo Data</TabsTrigger>
            </TabsList>

            {importMethod === "file" && (
              <div
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer ${
                  fileName
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                {fileName ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{fileName}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearFile()
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Drag and drop your file here or click to browse
                    </p>
                    <div className="flex gap-2 mt-2">
                      <FileJson className="h-5 w-5 text-blue-500" />
                      <FileSpreadsheet className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Supports CSV, JSON, and TS/JS files</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.ts,.js"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {importMethod === "demo" && (
              <div className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium">Demo Data</h3>
                    <p className="text-xs text-gray-500">Sample health data with 14 days of records</p>
                  </div>
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Demo Mode</AlertTitle>
                  <AlertDescription>
                    Using sample data for demonstration purposes. Your dashboard will display this data.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          {importMethod === "file" ? (
            <>
              <Button variant="outline" onClick={handleUseDemo}>
                Use Demo Data Instead
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} disabled={!!fileName}>
                Select File
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setImportMethod("file")}>
                Upload My Own Data
              </Button>
              <Button onClick={handleUseDemo}>Load Demo Data</Button>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Field Mapping Dialog */}
      <Dialog open={showMappingDialog} onOpenChange={setShowMappingDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Map Your Data Fields</DialogTitle>
            <DialogDescription>
              Your data structure doesn't match the expected format. Please map your fields to the required fields.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="autoDetect"
                checked={autoDetectFields}
                onCheckedChange={(checked) => {
                  setAutoDetectFields(checked as boolean)
                  if (checked && uploadedData) {
                    analyzeDataStructure(uploadedData)
                  }
                }}
              />
              <label
                htmlFor="autoDetect"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Auto-detect fields
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredFields.map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`field-${field}`} className="text-sm">
                    {getFieldDisplayName(field)}
                  </Label>
                  <Select value={mappedFields[field] || ""} onValueChange={(value) => updateMapping(field, value)}>
                    <SelectTrigger id={`field-${field}`}>
                      <SelectValue placeholder="Select a field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_mapped">Not mapped</SelectItem>
                      {availableFields.map((sourceField) => (
                        <SelectItem key={sourceField} value={sourceField}>
                          {getFieldDisplayName(sourceField)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {!allRequiredFieldsMapped() && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Some required fields are not mapped. The import may fail or data may be incomplete.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMappingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={applyMappings}>Import with Mappings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
