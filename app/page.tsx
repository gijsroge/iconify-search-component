import * as React from "react"
import { OpenInV0Button } from "@/components/open-in-v0-button"
import { IconifySearchDialog } from "@/registry/new-york/blocks/iconify-search-dialog/iconify-search-dialog"

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Iconify Search</h1>
        <p className="text-muted-foreground">
          Search and browse icons from the Iconify API.
        </p>
      </header>
      <main className="flex flex-col flex-1 gap-8">
        <div className="flex flex-col gap-4 border rounded-lg p-4 min-h-[200px] relative">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-muted-foreground sm:pl-3">
              Iconify Search Dialog (single)
            </h2>
            <OpenInV0Button name="iconify-search-dialog" className="w-fit" />
          </div>
          <div className="flex items-center justify-center min-h-[150px]">
            <IconifySearchDialog />
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-lg p-4 min-h-[200px] relative">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-muted-foreground sm:pl-3">
              Iconify Search Dialog (multiple)
            </h2>
            <OpenInV0Button name="iconify-search-dialog" className="w-fit" />
          </div>
          <div className="flex items-center justify-center min-h-[150px]">
            <IconifySearchDialog multiple />
          </div>
        </div>
      </main>
    </div>
  )
}
