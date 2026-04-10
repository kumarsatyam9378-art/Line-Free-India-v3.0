// src/utils/location.ts

export interface DetailedAddress {
  fullAddress: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

/**
 * Forward geocode: Get coordinates from pincode/address string using Nominatim (OpenStreetMap)
 */
export async function getCoordsFromPincode(pincode: string): Promise<{ lat: number; lng: number; display: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pincode + ', India')}&format=json&limit=1&accept-language=en`,
      {
        headers: {
          'User-Agent': 'LineFreeIndiaApp/1.0',
        }
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display: data[0].display_name || ''
      };
    }
    return null;
  } catch (e) {
    console.error('Forward geocoding failed:', e);
    return null;
  }
}

/**
 * Reverse geocodes latitude and longitude into a detailed, formatted English address
 * using a multi-source strategy (Nominatim + BigDataCloud) for high precision in India.
 */
export async function getAddressFromCoords(lat: number, lng: number): Promise<string | null> {
  try {
    // 1. Fetch from BigDataCloud (Excellent for Localities and Pincodes in India)
    let bdcData: any = null;
    try {
      const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      if (bdcRes.ok) bdcData = await bdcRes.json();
    } catch (e) { console.error("BDC Fetch failed", e); }

    // 2. Fetch from Nominatim (Excellent for Street names and roads)
    const nominatimRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'LineFreeIndiaApp/1.0',
        }
      }
    );

    if (!nominatimRes.ok && !bdcData) throw new Error('All geocoding services failed');

    const nomData = nominatimRes.ok ? await nominatimRes.json() : null;
    const addr = nomData?.address || {};

    // 3. Extract best possible parts
    const street = addr.road || addr.pedestrian || addr.footway || bdcData?.localityInfo?.informative?.find((i: any) => i.name.includes('Road'))?.name || "";
    const area = addr.suburb || addr.neighbourhood || addr.residential || addr.village || bdcData?.locality || bdcData?.principalSubdivision || "";
    const city = addr.city_district || addr.district || addr.city || addr.town || bdcData?.city || "";
    const state = addr.state || bdcData?.principalSubdivision || "";
    const pincode = addr.postcode || bdcData?.postcode || "";

    // 4. Construct "Complete" Indian-style address with more detail
    const parts = [
      street && street !== area ? street : '',
      area,
      city,
      state
    ].filter(Boolean);

    let finalAddress = parts.join(', ');
    if (pincode) finalAddress += ` - ${pincode}`;
    
    // If we have detailed info from BDC, use it
    if (bdcData?.localityInfo?.administrative) {
      const admin = bdcData.localityInfo.administrative;
      if (admin.length > 0) {
        const detailedParts = [
          admin[admin.length - 1]?.name, // Most specific area
          admin[admin.length - 2]?.name, // Parent area
          bdcData.city,
          bdcData.principalSubdivision
        ].filter(Boolean);
        if (detailedParts.length > parts.length) {
          finalAddress = detailedParts.join(', ');
          if (pincode) finalAddress += ` - ${pincode}`;
        }
      }
    }

    // fallback to nominatim's display name if construction failed
    if (parts.length <= 1 && nomData?.display_name) return nomData.display_name;
    
    return finalAddress;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
}
