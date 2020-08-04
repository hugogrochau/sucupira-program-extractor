interface GetParamsFromUrlOpts {
  host?: string
}
export const getParamsFromUrl = <T extends string>
  (url: string, params: T[], options: GetParamsFromUrlOpts = {}): Record<T, string> => {
  const parsedUrl = new URL(url, options.host)
  const result: Partial<Record<T, string>> = {}
  params.forEach((param) => {
    const paramValue = parsedUrl.searchParams.get(param)
    if (paramValue === null) {
      throw new Error(`Param ${paramValue} does not exist`)
    }

    result[param] = paramValue
  })

  return result as Record<T, string>
}
