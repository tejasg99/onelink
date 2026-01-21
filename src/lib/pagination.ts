export interface PaginationParams {
    page: number
    limit: number
}

export interface PaginatedResult<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        totalCount: number
        totalPages: number
        hasNextPage: boolean
        hasPrevPage: boolean
    }
}

export function getPaginationParams(
    searchParams: { [key: string]: string | string[] | undefined },
    defaultLimit: number = 12
): PaginationParams {
    const page = Math.max(1, parseInt(searchParams.page as string) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.limit as string) || defaultLimit))

    return { page, limit}
}

export function calculatePagination(
    page: number,
    limit: number,
    totalCount: number
) {
    const totalPages = Math.ceil(totalCount / limit)

    return {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    }
}