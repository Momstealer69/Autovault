export type MarketPackage = {
  id: string
  title: string
  price: string
  duration: string
  warranty: string
  coverage: string
  prep: string
  highlights: string[]
  badge: string
  note: string
  estimate: true
}

type PackageDetails = Omit<MarketPackage, 'badge' | 'note' | 'estimate'>

const catalog: Record<string, PackageDetails[]> = {
  PPF: [
    { id: 'estimate-ppf-partial', title: 'High-impact protection', price: '₹25,000–₹60,000', duration: '1–2 days', warranty: 'Film and installer dependent', coverage: 'Selected high-impact panels', prep: 'Paint inspection, decontamination and panel preparation', highlights: ['Bonnet, bumper, mirrors or selected panels', 'Price varies by film brand and coverage', 'Ask for film brand and warranty in writing'] },
    { id: 'estimate-ppf-front', title: 'Full front protection', price: '₹45,000–₹85,000', duration: '2–3 days', warranty: 'Film and installer dependent', coverage: 'Typical front-end kit; confirm exact panels', prep: 'Paint inspection and correction if needed', highlights: ['Front bumper, bonnet and mirrors commonly included', 'Coverage differs by kit and vehicle', 'Confirm edge wrapping and film brand'] },
    { id: 'estimate-ppf-full', title: 'Full body TPU protection', price: '₹90,000–₹1,50,000+', duration: '3–5 days', warranty: 'Brand terms vary; confirm in writing', coverage: 'Full vehicle exterior panels', prep: 'Detailed paint inspection and correction as needed', highlights: ['Indicative range for common vehicle sizes', 'Premium films and luxury vehicles can cost more', 'Ask about film thickness, warranty and aftercare'] },
  ],
  'Ceramic coating': [
    { id: 'estimate-ceramic-entry', title: 'Essential · 1 year', price: '₹8,000–₹15,000', duration: '1–2 days', warranty: 'Product-specific; confirm with studio', coverage: 'Paint coating; confirm glass and trim inclusions', prep: 'Wash, decontamination and light preparation', highlights: ['Entry-level coating option', 'Vehicle size and paint condition affect price', 'Ask which coating product is being applied'] },
    { id: 'estimate-ceramic-pro', title: 'Pro · 3 year', price: '₹15,000–₹30,000', duration: '2–3 days', warranty: 'Product-specific; maintenance may be required', coverage: 'Exterior painted panels', prep: 'Paint inspection and machine polish as required', highlights: ['Longer-term paint protection option', 'Confirm correction stages included', 'Request care and maintenance instructions'] },
    { id: 'estimate-ceramic-premium', title: 'Premium · 5 year', price: '₹30,000–₹50,000+', duration: '2–4 days', warranty: 'Brand warranty terms apply', coverage: 'Paint; glass, wheels and trim may be add-ons', prep: 'Paint correction and controlled application', highlights: ['Premium product and preparation tier', 'Luxury cars may exceed this range', 'Confirm warranty registration and servicing'] },
  ],
  'Graphene coating': [
    { id: 'estimate-graphene-3y', title: 'Graphene · 3 year', price: '₹18,000–₹30,000', duration: '2–3 days', warranty: 'Product-specific; confirm terms', coverage: 'Exterior paint coating', prep: 'Paint inspection and preparation polish', highlights: ['Vehicle-size-based pricing', 'Ask for product brand and maintenance schedule', 'Warranty depends on application and upkeep'] },
    { id: 'estimate-graphene-5y', title: 'Graphene · 5 year', price: '₹25,000–₹42,000', duration: '2–4 days', warranty: 'Brand terms; periodic maintenance may apply', coverage: 'Exterior paint; confirm other surfaces', prep: 'Paint correction may be recommended', highlights: ['Longer-term coating tier', 'Confirm correction work is included', 'Get warranty conditions before booking'] },
    { id: 'estimate-graphene-premium', title: 'Premium multi-layer', price: '₹35,000–₹55,000+', duration: '3–4 days', warranty: 'Confirm product-specific coverage', coverage: 'Paint with optional glass and wheel protection', prep: 'Multi-stage correction and controlled application', highlights: ['For larger or premium vehicles', 'Optional surfaces may change the price', 'Ask for itemized inclusions'] },
  ],
  Detailing: [
    { id: 'estimate-detail-refresh', title: 'Exterior refresh', price: '₹2,000–₹4,000', duration: '3–5 hours', warranty: 'Not applicable; confirm any workmanship guarantee', coverage: 'Exterior wash, decontamination and finish', prep: 'Vehicle condition check', highlights: ['Hand wash and paint decontamination', 'Light polish or sealant, depending on scope', 'Confirm exact steps before work starts'] },
    { id: 'estimate-detail-complete', title: 'Complete in-and-out detail', price: '₹4,000–₹8,000', duration: '5–8 hours', warranty: 'Not applicable; confirm any workmanship guarantee', coverage: 'Interior and exterior refresh', prep: 'Interior and paint condition assessment', highlights: ['Interior vacuum and surface cleaning', 'Exterior polish and paint protection', 'Price varies with vehicle size and condition'] },
    { id: 'estimate-detail-premium', title: 'Premium restoration detail', price: '₹8,000–₹15,000+', duration: '1–2 days', warranty: 'Confirm workmanship terms with studio', coverage: 'Deeper interior and multi-stage exterior work', prep: 'Inspection to agree paint and interior scope', highlights: ['More intensive polish and surface correction', 'Deep-cleaning steps depend on upholstery', 'Request a written scope before booking'] },
  ],
  'Paint correction': [
    { id: 'estimate-correction-panel', title: 'Single-panel correction', price: '₹1,200–₹2,500', duration: '2–4 hours', warranty: 'Not applicable; finish depends on paint condition', coverage: 'One selected painted panel', prep: 'Paint thickness and defect inspection', highlights: ['For isolated light swirls or haze', 'Deep scratches may not be safely removable', 'Confirm whether protection is included'] },
    { id: 'estimate-correction-single', title: 'Single-stage · full car', price: '₹6,000–₹15,000', duration: '1 day', warranty: 'Not applicable; confirm finish expectations', coverage: 'Exterior painted panels', prep: 'Wash, decontamination and test spot', highlights: ['Targets light swirls and dullness', 'Results vary with paint hardness and defects', 'Add a sealant or coating if desired'] },
    { id: 'estimate-correction-multi', title: 'Multi-stage correction', price: '₹12,000–₹25,000+', duration: '1–2 days', warranty: 'Not applicable; confirm finish expectations', coverage: 'Full exterior paint correction', prep: 'Paint inspection and test spot required', highlights: ['For heavier swirls and paint defects', 'Clear-coat limits affect achievable results', 'Protective coating is usually quoted separately'] },
  ],
  'Interior care': [
    { id: 'estimate-interior-refresh', title: 'Cabin refresh', price: '₹1,500–₹3,000', duration: '2–4 hours', warranty: 'Confirm any workmanship guarantee', coverage: 'Vacuum, dashboard, trims and glass', prep: 'Point out stains or delicate materials', highlights: ['Routine interior clean and dressing', 'Leather conditioning may be extra', 'Price depends on cabin size and condition'] },
    { id: 'estimate-interior-deep', title: 'Deep interior clean', price: '₹2,500–₹5,000', duration: '4–7 hours', warranty: 'Confirm drying and workmanship terms', coverage: 'Seats, carpets, mats and interior touchpoints', prep: 'Check upholstery type and stain areas', highlights: ['Steam or extraction where suitable', 'Roof-liner cleaning may be separately priced', 'Allow time for full cabin drying'] },
    { id: 'estimate-interior-premium', title: 'Premium cabin restoration', price: '₹4,000–₹8,000+', duration: '1 day', warranty: 'Confirm material-specific care terms', coverage: 'Deep clean with leather or fabric treatment', prep: 'Material inspection and stain assessment', highlights: ['For larger cabins or heavier soiling', 'Leather repair and odour treatment may cost extra', 'Confirm included surfaces before booking'] },
  ],
  'Car wash': [
    { id: 'estimate-wash-basic', title: 'Foam wash + vacuum', price: '₹400–₹1,100', duration: '45–90 minutes', warranty: 'Not applicable', coverage: 'Exterior wash, wheels, glass and cabin vacuum', prep: 'Remove valuables from the cabin', highlights: ['Vehicle-size-based range', 'Hand drying and tyre dressing may vary', 'Confirm water-spot treatment is not assumed'] },
    { id: 'estimate-wash-premium', title: 'Premium detail wash', price: '₹600–₹1,500', duration: '1–2 hours', warranty: 'Not applicable', coverage: 'Exterior, wheels, vacuum and spray protection', prep: 'Pre-rinse and check delicate paintwork', highlights: ['More thorough wheel and surface cleaning', 'Wax or spray sealant depends on package', 'Ask what the quoted wash includes'] },
    { id: 'estimate-wash-pack', title: 'Four-wash care pack', price: '₹2,000–₹4,500', duration: 'Scheduled visits', warranty: 'Terms depend on studio', coverage: 'Four maintenance washes; confirm expiry', prep: 'Confirm booking and package validity', highlights: ['Indicative bundle pricing', 'Vehicle category can change the total', 'Confirm whether the pack is transferable'] },
  ],
  'Steam wash': [
    { id: 'estimate-steam-refresh', title: 'Steam cabin refresh', price: '₹800–₹1,800', duration: '1–2 hours', warranty: 'Not applicable', coverage: 'Interior touchpoints and selected surfaces', prep: 'Tell the technician about leather or electronics', highlights: ['Light steam cleaning for suitable surfaces', 'Not a substitute for deep extraction', 'Confirm which cabin areas are included'] },
    { id: 'estimate-steam-interior', title: 'Interior steam detail', price: '₹1,500–₹3,500', duration: '3–5 hours', warranty: 'Confirm workmanship and drying terms', coverage: 'Seats, carpets and interior touchpoints', prep: 'Upholstery and material inspection', highlights: ['Deeper treatment for cabin surfaces', 'Some materials require low-moisture methods', 'Drying time depends on weather and ventilation'] },
    { id: 'estimate-steam-deep', title: 'Steam + extraction clean', price: '₹2,500–₹5,000+', duration: '4–8 hours', warranty: 'Confirm workmanship terms', coverage: 'Deep interior clean with suitable extraction', prep: 'Stain and upholstery assessment', highlights: ['For heavier soil and fabric interiors', 'Roof liner and leather treatment may be excluded', 'Confirm final scope before work begins'] },
  ],
  'Vinyl wraps': [
    { id: 'estimate-wrap-accent', title: 'Partial colour wrap', price: '₹25,000–₹40,000', duration: '1–2 days', warranty: 'Film and installation warranty vary', coverage: 'Selected panels or accents', prep: 'Paint and panel inspection', highlights: ['Gloss, matte or satin options', 'Film brand and design affect price', 'Confirm removal and edge-finish terms'] },
    { id: 'estimate-wrap-full', title: 'Full body colour change', price: '₹55,000–₹95,000+', duration: '3–5 days', warranty: 'Film manufacturer terms apply', coverage: 'Full exterior wrap; door jambs may be extra', prep: 'Paint must be clean and in suitable condition', highlights: ['Vehicle size and body shape affect cost', 'Premium films cost more', 'Ask about registration rules for colour changes'] },
    { id: 'estimate-wrap-premium', title: 'Premium film installation', price: '₹95,000–₹1,50,000+', duration: '4–7 days', warranty: 'Confirm brand and installer coverage', coverage: 'Large vehicle or premium full-wrap scope', prep: 'Detailed inspection and panel preparation', highlights: ['For premium films or complex vehicles', 'Door jambs and trims may be priced separately', 'Confirm film brand, finish and aftercare'] },
  ],
  'Bike care': [
    { id: 'estimate-bike-wash', title: 'Bike wash & finish', price: '₹200–₹800', duration: '45–90 minutes', warranty: 'Not applicable', coverage: 'Bodywork, wheels and accessible surfaces', prep: 'Tell the studio about aftermarket parts', highlights: ['Two-wheeler size and condition affect price', 'Chain cleaning may be an add-on', 'Confirm safe drying around electrical parts'] },
    { id: 'estimate-bike-detail', title: 'Complete bike detail', price: '₹1,500–₹5,000', duration: '3–6 hours', warranty: 'Confirm any workmanship guarantee', coverage: 'Paint, trim, wheels and selected metalwork', prep: 'Check decals, matte finishes and accessories', highlights: ['Deep clean and finish treatment', 'Cruisers and superbikes may cost more', 'Confirm whether polishing is included'] },
    { id: 'estimate-bike-coating', title: 'Bike ceramic protection', price: '₹5,000–₹15,000+', duration: '1–2 days', warranty: 'Product-specific; confirm terms', coverage: 'Painted body panels; trim may be extra', prep: 'Decontamination and paint preparation', highlights: ['Product and bodywork size affect cost', 'Ask for coating brand and cure time', 'Maintenance and warranty terms vary'] },
  ],
  'Car denting & painting': [
    { id: 'estimate-paint-panel', title: 'Single-panel repaint', price: '₹5,000–₹12,000', duration: '1–3 days', warranty: 'Confirm paint and workmanship warranty', coverage: 'One bumper, fender or door panel', prep: 'Dent, rust and paint-match inspection', highlights: ['Damage repair may be additional', 'Metallic and pearl paints can cost more', 'Confirm paint system and blending scope'] },
    { id: 'estimate-paint-multiple', title: 'Multi-panel repaint', price: '₹12,000–₹30,000', duration: '3–6 days', warranty: 'Confirm paint and workmanship warranty', coverage: 'Typically two to four panels', prep: 'Panel-by-panel inspection and colour matching', highlights: ['Range depends on panel count and damage', 'Dismantling or rust repair may be extra', 'Ask whether adjacent-panel blending is included'] },
    { id: 'estimate-paint-full', title: 'Full body repaint', price: '₹40,000–₹1,00,000+', duration: '1–3 weeks', warranty: 'Confirm written paint warranty', coverage: 'Full vehicle exterior; same-colour repaint', prep: 'Full inspection and paint matching', highlights: ['Colour change can cost more', 'Premium finishes and luxury vehicles exceed range', 'Confirm booth process, materials and timeline'] },
  ],
  'Window film': [
    { id: 'estimate-window-basic', title: 'Solar-control film', price: '₹4,500–₹11,000', duration: '2–4 hours', warranty: 'Film manufacturer terms apply', coverage: 'Side and rear glass; confirm windscreen scope', prep: 'Glass inspection and careful interior masking', highlights: ['Film type and vehicle glass area affect cost', 'Confirm brand and heat-rejection specifications', 'Ask the studio to confirm applicable road rules'] },
    { id: 'estimate-window-ceramic', title: 'Ceramic window film', price: '₹9,000–₹14,000', duration: '3–5 hours', warranty: 'Confirm film brand and written warranty', coverage: 'Vehicle side and rear glass', prep: 'Clean-room style installation and glass inspection', highlights: ['Premium heat-rejection film tier', 'Vehicle size and film series affect price', 'Confirm permitted visible-light transmission'] },
    { id: 'estimate-window-premium', title: 'Premium multi-window film', price: '₹14,000–₹23,000+', duration: '3–5 hours', warranty: 'Brand-specific; request warranty terms', coverage: 'Full glass package; exact pieces to confirm', prep: 'Glass inspection and precision installation', highlights: ['Premium film brands can exceed the range', 'Windscreen treatment may be separate', 'Confirm local compliance before installation'] },
  ],
  Accessories: [
    { id: 'estimate-accessory-camera', title: 'Dashcam installation', price: '₹3,000–₹6,500', duration: '1–3 hours', warranty: 'Device and installation terms vary', coverage: 'Front or front-and-rear camera installation', prep: 'Confirm camera model and vehicle wiring', highlights: ['Camera hardware may be included or extra', 'Concealed wiring depends on vehicle layout', 'Ask about parking-mode power protection'] },
    { id: 'estimate-accessory-comfort', title: 'Interior comfort upgrade', price: '₹5,000–₹12,000', duration: '2–5 hours', warranty: 'Parts warranty depends on supplier', coverage: 'Seat covers or cabin accessory bundle', prep: 'Confirm vehicle model and seat configuration', highlights: ['Material and custom fit change the price', 'Installation labour may be additional', 'Confirm airbag-safe fitment'] },
    { id: 'estimate-accessory-audio', title: 'Audio & convenience upgrade', price: '₹8,000–₹25,000+', duration: 'Half day to 1 day', warranty: 'Parts and installation warranties vary', coverage: 'Selected speakers, camera or lighting accessories', prep: 'Vehicle compatibility and electrical check', highlights: ['Components may be priced separately', 'Complex builds require an itemized quote', 'Confirm compatibility with factory electronics'] },
  ],
  'Car customization': [
    { id: 'estimate-custom-trim', title: 'Trim & styling refresh', price: '₹3,000–₹12,000', duration: '2–6 hours', warranty: 'Material and fitting terms vary', coverage: 'Selected trim, badges or accent pieces', prep: 'Confirm fitment and finish samples', highlights: ['Parts and finish determine the range', 'Removal of existing trim may cost extra', 'Ask for reversible installation options'] },
    { id: 'estimate-custom-lighting', title: 'Lighting & cabin upgrade', price: '₹5,000–₹20,000', duration: 'Half day', warranty: 'Parts and wiring warranty vary', coverage: 'Selected cabin or exterior lighting upgrades', prep: 'Electrical and vehicle compatibility check', highlights: ['Parts may be additional', 'Installation complexity affects price', 'Confirm road-use compliance for exterior lights'] },
    { id: 'estimate-custom-body', title: 'Body & performance customization', price: '₹15,000–₹75,000+', duration: '1–5 days', warranty: 'Part and installation specific', coverage: 'Selected body kit or bolt-on upgrades', prep: 'Vehicle inspection and fitment plan', highlights: ['Custom fabrication is priced after design', 'Paint, wiring or calibration may be extra', 'Confirm safety, insurance and road-use requirements'] },
  ],
  'Car restoration': [
    { id: 'estimate-restoration-detail', title: 'Cosmetic restoration', price: '₹15,000–₹50,000', duration: '3–10 days', warranty: 'Confirm paint and workmanship coverage', coverage: 'Selected paint, trim and interior refresh', prep: 'Condition inspection and agreed work list', highlights: ['Scope and parts availability drive the final price', 'Mechanical repairs are separate', 'Request staged approval for additional work'] },
    { id: 'estimate-restoration-panel', title: 'Body & paint restoration', price: '₹40,000–₹1,50,000+', duration: '1–4 weeks', warranty: 'Confirm written paint and repair terms', coverage: 'Multiple body panels and finish restoration', prep: 'Rust, dent and paint inspection', highlights: ['Rust repair and dismantling change the cost', 'Parts and paint system may be additional', 'Agree the finish standard before work begins'] },
    { id: 'estimate-restoration-full', title: 'Full vehicle restoration', price: '₹1,00,000–₹5,00,000+', duration: 'Several weeks or longer', warranty: 'Project-specific; document the scope', coverage: 'Full cosmetic restoration; mechanical work varies', prep: 'Detailed vehicle assessment and itemized plan', highlights: ['Highly variable by age, condition and parts', 'Mechanical restoration may be quoted separately', 'Use milestone approvals and a written estimate'] },
  ],
  'Car service': [
    { id: 'estimate-service-basic', title: 'Basic maintenance visit', price: '₹2,500–₹6,000', duration: '2–4 hours', warranty: 'Parts and labour terms vary', coverage: 'Inspection, fluids and routine consumables as agreed', prep: 'Share service history and warning lights', highlights: ['Parts and engine oil may be billed separately', 'Vehicle model affects labour and consumables', 'Confirm the included checklist before approval'] },
    { id: 'estimate-service-periodic', title: 'Periodic service', price: '₹5,000–₹15,000', duration: 'Half day', warranty: 'Confirm parts and workmanship terms', coverage: 'Routine service based on vehicle schedule', prep: 'Bring service history and vehicle documents', highlights: ['Model, age and parts determine total cost', 'Repairs found during inspection are extra', 'Approve additional work before it starts'] },
    { id: 'estimate-service-major', title: 'Major service & diagnostics', price: '₹15,000–₹50,000+', duration: '1–3 days', warranty: 'Parts and labour warranty depend on provider', coverage: 'Diagnostics and larger scheduled maintenance scope', prep: 'Diagnostic scan and written inspection', highlights: ['Use a vehicle-specific inspection plan', 'Replacement parts can change the estimate substantially', 'Request an itemized estimate before repairs'] },
  ],
}

export function estimatedPackagesFor(studioName: string, service: string): MarketPackage[] {
  const normalizedService = service === 'Vinyl wrapping' ? 'Vinyl wraps' : service
  const packages = catalog[normalizedService] ?? catalog.Detailing
  return packages.map(pkg => ({
    ...pkg,
    estimate: true,
    badge: 'AUTOVAULT MARKET ESTIMATE',
    note: `Indicative market range only—not a published price from ${studioName}. Final cost depends on the vehicle, condition and confirmed work scope.`,
  }))
}
