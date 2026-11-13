import { useRef, useState, type ChangeEvent } from 'react'
import { Download, Upload, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { exportBackup, downloadBackup, readBackupFile } from '@/services/backupService'
import { ImportConfirmDialog } from './ImportConfirmDialog'
import type { BackupData } from '@/types/backup'

export function BackupSection() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingBackup, setPendingBackup] = useState<BackupData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    setError(null)
    try {
      const data = await exportBackup()
      downloadBackup(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar backup.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // permite selecionar o mesmo arquivo de novo depois, se precisar
    if (!file) return

    setError(null)
    try {
      const data = await readBackupFile(file)
      setPendingBackup(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ler o arquivo de backup.')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
          <Download size={14} /> {isExporting ? 'Exportando...' : 'Exportar backup'}
        </Button>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          <Upload size={14} /> Importar backup
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-arena-red">
          <AlertCircle size={13} /> {error}
        </p>
      )}

      <p className="text-xs text-arena-text-faint">
        O backup exporta todos os dados (perfis, eventos, lutas, apostas, resultados e histórico) em um
        arquivo JSON (<code>ufc-points-backup-AAAA-MM-DD.json</code>). Ao importar, você escolhe entre
        mesclar com os dados atuais ou substituir tudo — sempre com confirmação antes de substituir.
      </p>

      {pendingBackup && (
        <ImportConfirmDialog backup={pendingBackup} onClose={() => setPendingBackup(null)} />
      )}
    </div>
  )
}
