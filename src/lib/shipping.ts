// Shipping rates from Tennessee based on zones
// Zone 1: Tennessee (local)
// Zone 2: Bordering states
// Zone 3: Southeast region
// Zone 4: Midwest/Northeast
// Zone 5: West Coast and distant states

export const stateShippingRates = {
  // Zone 1 - Tennessee (Local) - $8
  TN: 800,

  // Zone 2 - Bordering States - $12
  KY: 1200,
  VA: 1200,
  NC: 1200,
  GA: 1200,
  AL: 1200,
  MS: 1200,
  AR: 1200,
  MO: 1200,

  // Zone 3 - Southeast/Nearby - $15
  SC: 1500,
  FL: 1500,
  LA: 1500,
  WV: 1500,
  OH: 1500,
  IN: 1500,
  IL: 1500,
  KS: 1500,
  OK: 1500,
  TX: 1500,

  // Zone 4 - Midwest/Northeast - $18
  MI: 1800,
  WI: 1800,
  IA: 1800,
  MN: 1800,
  NE: 1800,
  SD: 1800,
  ND: 1800,
  PA: 1800,
  NY: 1800,
  NJ: 1800,
  DE: 1800,
  MD: 1800,
  CT: 1800,
  RI: 1800,
  MA: 1800,
  VT: 1800,
  NH: 1800,
  ME: 1800,

  // Zone 5 - West/Far - $22
  MT: 2200,
  WY: 2200,
  CO: 2200,
  NM: 2200,
  AZ: 2200,
  UT: 2200,
  NV: 2200,
  ID: 2200,
  WA: 2200,
  OR: 2200,
  CA: 2200,
  AK: 2500, // Alaska - extra
  HI: 2500, // Hawaii - extra
};

export function calculateShippingByState(state: string, subtotal: number): number {
  // Free shipping over $150
  if (subtotal >= 15000) {
    return 0;
  }

  // Get state shipping rate (default to $18 if state not found)
  const stateCode = state.toUpperCase();
  return stateShippingRates[stateCode as keyof typeof stateShippingRates] || 1800;
}

export function formatStateName(state: string): string {
  const states: Record<string, string> = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
  };
  return states[state.toUpperCase()] || state;
}

export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];
