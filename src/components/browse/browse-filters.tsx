"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"

interface BrowseFiltersProps {
    currentType: string
    currentSort: string
}

const contentTypes = [
    { value: "ALL", label: "All Types", icon: Icons.globe },
    { value: "TEXT", label: "Text", icon: Icons.text },
    { value: "CODE", label: "Code", icon: Icons.code },
    { value: "FILE", label: "Files", icon: Icons.file },
    { value: "LINKS", label: "Links", icon: Icons.links },
]

export function BrowseFilters({ currentType, currentSort }: BrowseFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const createQueryString = useCallback((params: Record<string, string>) => {
        const newSearchParams = new URLSearchParams(searchParams.toString())

        Object.entries(params).forEach(([key, value]) => {
            if (value === "ALL" || value === "recent") {
                newSearchParams.delete(key)
            } else {
                newSearchParams.set(key, value)
            }
        })

        // Reset to page 1 when filters change
        newSearchParams.delete("page")

        return newSearchParams.toString()
    }, [searchParams])

    const handleTypeChange = (value: string) => {
        const query = createQueryString({ type: value })
        router.push(`/browse${query ? `?${query}` : ""}`)
    }

    const handleSortChange = (value: string) => {
        const query = createQueryString({ sortBy: value })
        router.push(`/browse${query ? `?${query}` : ""}`)
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Type Filter - Tabs on larger screens */}
            <div className="hidden md:block">
                <Tabs value={currentType} onValueChange={handleTypeChange}>
                    <TabsList>
                        {contentTypes.map((type) => {
                            const Icon = type.icon
                            return (
                                <TabsTrigger
                                    key={type.value}
                                    value={type.value}
                                    className="flex items-center gap-2"
                                >
                                    <Icon className="h-4 w-4" />
                                    {type.label}
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                </Tabs>
            </div>

            {/* Type Filter - Select on mobile */}
            <div className="md:hidden">
                <Select value={currentType} onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        {contentTypes.map((type) => {
                            const Icon = type.icon
                            return (
                                <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {type.label}
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            </div>

            {/* Sort Filter */}
            <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="recent">
                        <div className="flex items-center gap-2">
                            <Icons.clock className="h-4 w-4" />
                            Most Recent
                        </div>
                    </SelectItem>
                    <SelectItem value="popular">
                        <div className="flex items-center gap-2">
                            <Icons.eye className="h-4 w-4" />
                            Most Popular
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}