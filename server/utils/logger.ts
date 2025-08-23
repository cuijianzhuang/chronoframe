import { createConsola } from 'consola'

const mConsola = createConsola({
  formatOptions: {
    date: true,
    colors: true,
    compact: false,
  },
})

export const logger = {
  chrono: mConsola.withTag('CHRONO'),
  storage: mConsola.withTag('STORAGE'),
  fs: mConsola.withTag('FS'),
  dynamic: (id: string) => mConsola.withTag(id.toUpperCase()),
}

export type Logger = typeof logger
export type DynamicLogger = typeof logger.dynamic
