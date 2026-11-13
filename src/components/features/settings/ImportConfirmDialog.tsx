import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { importBackup } from '@/services/backupService'
import type { ImportMode } from '@/services/backupService'
import type { BackupData } from '@/types/backup'

interface ImportConfirmDialogProps {
  backup: BackupData
  onClose: () => void
}

export function ImportConfirmDialog({ backup, onClose }: ImportConfirmDialogProps) {
  const [mode, setMode] = useState<ImportMode>('merge')
  const [confirmReplace, setConfirmReplace] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportedAtLabel = new Date(backup.exportedAt).toLocaleString('pt-BR')

  async function handleConfirm() {
    if (mode === 'replace' && !confirmReplace) return

    setIsImporting(true)
    setError(null)
    try {
      await importBackup(backup, mode)
      // Recarrega a página inteira: garante que todas as stores (perfis,
      // eventos, apostas, resultados) reflitam o novo estado do banco sem
      // risco de alguma ficar dessincronizada depois de uma troca em massa.
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar backup.')
      setIsImporting(false)
    }
  }

  return (
    <Modal title="Importar backup" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-lg border border-arena-border bg-arena-bg/60 p-3 text-sm">
          <p className="text-arena-text-faint">Exportado em {exportedAtLabel}</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs text-arena-text-muted">
            <span>{backup.profiles.length} perfis</span>
            <span>{backup.events.length} eventos</span>
            <span>{backup.fights.length} lutas</span>
            <span>{backup.bets.length} apostas</span>
            <span>{backup.results.length} resultados</span>
            <span>{backup.transactions.length} transações</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-arena-border p-3 has-[:checked]:border-arena-red has-[:checked]:bg-arena-red/10">
            <input
              type="radio"
              name="import-mode"
              value="merge"
              checked={mode === 'merge'}
              onChange={() => setMode('merge')}
              className="mt-0.5 accent-arena-red"
            />
            <span>
              <span className="block text-sm font-medium">Mesclar com os dados atuais</span>
              <span className="block text-xs text-arena-text-faint">
                Adiciona o que não existe e atualiza registros com o mesmo ID. Nada é apagado.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-arena-border p-3 has-[:checked]:border-arena-red has-[:checked]:bg-arena-red/10">
            <input
              type="radio"
              name="import-mode"
              value="replace"
              checked={mode === 'replace'}
              onChange={() => setMode('replace')}
              className="mt-0.5 accent-arena-red"
            />
            <span>
              <span className="block text-sm font-medium text-arena-red">Substituir tudo</span>
              <span className="block text-xs text-arena-text-faint">
                Apaga todos os dados atuais e coloca só o que está neste arquivo. Não pode ser desfeito.
              </span>
            </span>
          </label>
        </div>

        {mode === 'replace' && (
          <label className="flex items-start gap-2 rounded-lg border border-arena-red/30 bg-arena-red/10 p-3 text-xs text-arena-red">
            <input
              type="checkbox"
              checked={confirmReplace}
              onChange={(event) => setConfirmReplace(event.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            Entendo que isso vai apagar todos os dados atuais e não pode ser desfeito.
          </label>
        )}

        {error && <p className="text-xs text-arena-red">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={mode === 'replace' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            disabled={isImporting || (mode === 'replace' && !confirmReplace)}
          >
            {mode === 'replace' ? 'Substituir tudo' : 'Mesclar dados'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
