export const STATE_OPTIONS = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
] as const;

export type StateCode = (typeof STATE_OPTIONS)[number]["value"];

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  suburb: string;
  state: StateCode;
  postcode: string;
}

export function createDefaultAddress(): Address {
  return {
    addressLine1: "",
    addressLine2: "",
    suburb: "",
    state: "NSW",
    postcode: "",
  };
}

export function validateAddress(
  address: Address,
): Partial<Record<keyof Address, string>> {
  const errors: Partial<Record<keyof Address, string>> = {};

  const line1 = address.addressLine1.trim();
  if (!line1) {
    errors.addressLine1 = "Street address is required";
  } else if (line1.length < 5) {
    errors.addressLine1 = "Street address must be at least 5 characters";
  }

  if (address.addressLine2 !== undefined) {
    const line2 = address.addressLine2.trim();
    if (line2.length > 0 && line2.length < 3) {
      errors.addressLine2 = "Too short if provided";
    }
  }

  if (!address.suburb.trim()) {
    errors.suburb = "Suburb / City is required";
  }

  if (!address.state) {
    errors.state = "State is required";
  } else if (!(["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"] as const).includes(address.state as StateCode)) {
    errors.state = "Please select a valid Australian state/territory";
  }

  const pc = address.postcode.trim();
  if (!pc) {
    errors.postcode = "Postcode is required";
  } else if (!/^\d{4}$/.test(pc)) {
    errors.postcode = "Must be a 4-digit postcode";
  }

  return errors;
}

const STATE_NAME_MAP: Record<string, StateCode> = {
  "new south wales": "NSW",
  "victoria": "VIC",
  "queensland": "QLD",
  "western australia": "WA",
  "south australia": "SA",
  "tasmania": "TAS",
  "australian capital territory": "ACT",
  "northern territory": "NT",
};

export function normalizeState(raw: string): StateCode {
  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();
  if ((["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"] as const).includes(upper as StateCode)) {
    return upper as StateCode;
  }
  return STATE_NAME_MAP[trimmed.toLowerCase()] || "NSW";
}

export function isAddressValid(address: Address): boolean {
  return Object.keys(validateAddress(address)).length === 0;
}

export function addressToShippingBody(
  address: Address,
  customerName: string,
  phone: string,
) {
  return {
    name: customerName,
    addressLine1: address.addressLine1.trim(),
    addressLine2: address.addressLine2?.trim() || undefined,
    suburb: address.suburb.trim(),
    state: address.state,
    postcode: address.postcode.trim(),
    phoneNumber: phone,
  };
}
