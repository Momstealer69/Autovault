export type GooglePlace = {
  id: string
  displayName?: string
  formattedAddress?: string
  rating?: number
  userRatingCount?: number
  googleMapsURI?: string
  photoUrl?: string
  photoAttributions?: string[]
  types?: string[]
}

type GoogleWindow = Window & { google?: { maps?: Record<string, unknown> } }
let mapsPromise: Promise<Record<string, unknown>> | undefined

async function loadPlaces() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!key) throw new Error('Google Maps is not configured yet. Add VITE_GOOGLE_MAPS_API_KEY in the Vercel project settings.')
  if (!mapsPromise) mapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps]')
    const done = () => {
      const maps = (window as GoogleWindow).google?.maps
      if (maps) resolve(maps)
      else reject(new Error('Google Maps could not load. Check the key restrictions and enabled APIs.'))
    }
    if (existing) { existing.addEventListener('load', done, { once: true }); existing.addEventListener('error', () => reject(new Error('Google Maps could not load.')), { once: true }); if ((window as GoogleWindow).google?.maps) done(); return }
    const script = document.createElement('script')
    script.dataset.googleMaps = 'true'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async`
    script.async = true
    script.onload = done
    script.onerror = () => reject(new Error('Google Maps could not load. Check the key restrictions and enabled APIs.'))
    document.head.appendChild(script)
  })
  return mapsPromise
}

export async function searchGooglePlaces(query: string): Promise<GooglePlace[]> {
  const maps = await loadPlaces()
  const placesLibrary = await (maps.importLibrary as (name: string) => Promise<Record<string, unknown>>).call(maps, 'places')
  const Place = placesLibrary.Place as { searchByText: (request: Record<string, unknown>) => Promise<{ places?: Array<Record<string, unknown>> }> }
  const result = await Place.searchByText({
    textQuery: query,
    fields: ['id', 'displayName', 'formattedAddress', 'rating', 'userRatingCount', 'photos', 'googleMapsURI', 'types'],
    maxResultCount: 12,
    language: 'en',
    region: 'in',
  })
  return (result.places ?? []).map((place) => {
    const photo = (place.photos as Array<{ getURI: (options: { maxWidth: number }) => string; authorAttributions?: Array<{ displayName?: string; uri?: string }> }> | undefined)?.[0]
    return {
      id: String(place.id ?? crypto.randomUUID()),
      displayName: (place.displayName as { text?: string } | undefined)?.text,
      formattedAddress: place.formattedAddress as string | undefined,
      rating: place.rating as number | undefined,
      userRatingCount: place.userRatingCount as number | undefined,
      googleMapsURI: place.googleMapsURI as string | undefined,
      photoUrl: photo?.getURI({ maxWidth: 1000 }),
      photoAttributions: photo?.authorAttributions?.map((item) => item.uri ? `${item.displayName ?? 'Photo contributor'}|${item.uri}` : item.displayName ?? 'Photo contributor'),
      types: place.types as string[] | undefined,
    }
  })
}
