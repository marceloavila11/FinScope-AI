import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import type { FinancialRecord } from "../types/financial"

interface FinancialContextType {
  records: FinancialRecord[]
  setRecords: React.Dispatch<React.SetStateAction<FinancialRecord[]>>
  refreshFlag: boolean
  setRefreshFlag: React.Dispatch<React.SetStateAction<boolean>>
  aiRefreshFlag: boolean
  triggerAIRefresh: () => void
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined)

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [refreshFlag, setRefreshFlag] = useState(false)
  const [aiRefreshFlag, setAIRefreshFlag] = useState(false)

  const triggerAIRefresh = () => setAIRefreshFlag((prev) => !prev)

  return (
    <FinancialContext.Provider
      value={{
        records,
        setRecords,
        refreshFlag,
        setRefreshFlag,
        aiRefreshFlag,
        triggerAIRefresh,
      }}
    >
      {children}
    </FinancialContext.Provider>
  )
}

export const useFinancial = () => {
  const context = useContext(FinancialContext)
  if (!context) throw new Error("useFinancial debe usarse dentro de FinancialProvider")
  return context
}
