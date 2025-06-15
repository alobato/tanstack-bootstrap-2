import { createServerFn } from '@tanstack/start'
import { locales } from '@/paraglide/runtime'

type LocaleType = "en" | "de" | "pt"

export const getServerLocale = createServerFn()
  .handler(async () => {
    const request = await fetch('/api/locale')
    const acceptLanguage = request.headers.get('accept-language')
    console.log('getServerLocale - accept-language header:', acceptLanguage)

    if (acceptLanguage) {
      const preferredLocale = acceptLanguage.split(',')[0].split('-')[0] as LocaleType
      if (locales.includes(preferredLocale)) {
        return preferredLocale
      }
    }
    return 'en' as LocaleType
  })

export const setServerLocale = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!data || typeof data !== 'object' || !('locale' in data)) {
      throw new Error('Dados inválidos: objeto esperado')
    }
    const { locale } = data as { locale?: LocaleType }
    if (!locale) throw new Error('Locale não fornecido')
    if (!locales.includes(locale)) throw new Error('Locale não suportado')
    return data as { locale: LocaleType }
  })
  .handler(async ({ data }) => {
    console.log('setServerLocale - setting locale to:', data.locale)
    return { success: true, locale: data.locale }
  })
