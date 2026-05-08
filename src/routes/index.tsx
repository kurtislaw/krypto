import { createFileRoute } from '@tanstack/react-router'
import { CipherPanel } from '#/components/CipherPanel'

export const Route = createFileRoute('/')({ component: CipherPanel })
