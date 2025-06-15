import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import * as m from '@/paraglide/messages'
import { getLocale, setLocale, locales } from '@/paraglide/runtime'
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/theme-context";
import { getServerLocale, setServerLocale } from '@/lib/locale'

type LocaleType = "en" | "de" | "pt"

export const Route = createFileRoute('/_authenticated/protected')({
  beforeLoad: async ({ context }) => {
    try {
      const serverLocale = await getServerLocale()
      if (serverLocale && locales.includes(serverLocale as LocaleType)) {
        setLocale(serverLocale as LocaleType)
      } else {
        setLocale("en")
      }
    } catch (error) {
      console.error('Error fetching language:', error)
      setLocale("en")
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { setTheme } = useTheme()

  const handleLocaleChange = async (newLocale: LocaleType) => {
    try {
      const result = await setServerLocale({ data: { locale: newLocale } })
      if (result.success) {
        setLocale(newLocale)
      } else {
        console.error('Failed to set locale')
      }
    } catch (error) {
      console.error('Error changing language:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <h1>Idioma atual: {getLocale()}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Mudar Idioma
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleLocaleChange('en')}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLocaleChange('pt')}>
              Português
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLocaleChange('de')}>
              Deutsch
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="!h-[1.2rem] !w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute !h-[1.2rem] !w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h1>{m.example_message({ username: 'John Doe' })}</h1>
      <h1>{m.example_message({ username: 'John Doe' }, { locale: 'de' })}</h1>
      <Outlet />
    </div>
  )
}
