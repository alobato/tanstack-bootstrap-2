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
import { useEffect } from 'react';

export const Route = createFileRoute('/_authenticated/protected')({
  // beforeLoad: async ({ location }) => {
    // console.log("beforeLoad location", location);
    // Chama a API que retorna o usuário autenticado (usa cookie)
    // try {
    //   const res = await fetch('http://localhost:3000/api/me', { credentials: 'include' })
    //   const data = await res.json() as { user: { id: number; email: string } | null }
    //   console.log("----data", data);
    //   if (!data.user) {
    //     throw redirect({ to: '/sign-in', search: { redirect: location.pathname } })
    //   }
    // } catch (error) {
    //   console.error("Error in beforeLoad", error);
    //   // throw redirect({ to: '/sign-in', search: { redirect: location.pathname } })
    // }

  // },
  component: RouteComponent,
})

function RouteComponent() {

  const { setTheme } = useTheme()

  useEffect(() => {
    const lang = navigator.languages?.[0] || navigator.language;
    const baseLang = lang.split("-")[0] as "en" | "de" | "pt";

    if (locales.includes(lang as "en" | "de" | "pt")) {
      setLocale(lang as "en" | "de" | "pt");
    } else if (locales.includes(baseLang)) {
      setLocale(baseLang);
    } else {
      setLocale("en");
    }
  }, []);

  return (
    <div>
      <h1 onClick={() => setLocale('pt')}>{getLocale()}</h1>
      <div>
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
