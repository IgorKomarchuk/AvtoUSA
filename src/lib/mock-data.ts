import type { VehicleData } from "./types";

const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000);

const records = [
  ["2022-bmw-x5-xdrive40i-copart-69420165", "2022 BMW X5 xDrive40i", "BMW", "X5", "xDrive40i", "COPART", "69420165", "5UXCR6C05N9K20165", 2022, 7450, 14800, 38420, "Front End", "Miami", "FL", "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=84", "White", "3.0L I6 Turbo", "Automatic", "AWD", "SUV"],
  ["2021-mercedes-gle-350-iaai-41870291", "2021 Mercedes-Benz GLE 350", "Mercedes-Benz", "GLE", "350 4MATIC", "IAAI", "41870291", "4JGFB4KB5MA370291", 2021, 9200, null, 42110, "Rear End", "Houston", "TX", "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=84", "Black", "2.0L Turbo", "Automatic", "AWD", "SUV"],
  ["2023-audi-q7-premium-copart-61388420", "2023 Audi Q7 Premium Plus", "Audi", "Q7", "Premium Plus", "COPART", "61388420", "WA1LXAF75PD038420", 2023, 11250, 22100, 19880, "Side", "Atlanta", "GA", "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=84", "Blue", "3.0L V6", "Automatic", "AWD", "SUV"],
  ["2020-ford-mustang-gt-iaai-40571988", "2020 Ford Mustang GT", "Ford", "Mustang", "GT", "IAAI", "40571988", "1FA6P8CF2L5151988", 2020, 8350, null, 31750, "Front End", "Los Angeles", "CA", "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1600&q=84", "Red", "5.0L V8", "Automatic", "RWD", "Coupe"],
  ["2022-tesla-model-3-long-range-copart-72150461", "2022 Tesla Model 3 Long Range", "Tesla", "Model 3", "Long Range", "COPART", "72150461", "5YJ3E1EB7NF150461", 2022, 10400, 17900, 28940, "Minor Dent/Scratches", "Sacramento", "CA", "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=84", "White", "Dual Motor", "Automatic", "AWD", "Sedan"],
  ["2023-toyota-camry-xse-iaai-39214607", "2023 Toyota Camry XSE", "Toyota", "Camry", "XSE", "IAAI", "39214607", "4T1K61AK8PU214607", 2023, 12700, null, 15620, "Hail", "Denver", "CO", "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1600&q=84", "Silver", "2.5L I4", "Automatic", "FWD", "Sedan"],
  ["2021-jeep-grand-cherokee-limited-copart-58326014", "2021 Jeep Grand Cherokee Limited", "Jeep", "Grand Cherokee", "Limited", "COPART", "58326014", "1C4RJFBG4MC326014", 2021, 6800, 13500, 47630, "Rear End", "Chicago", "IL", "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=84", "Gray", "3.6L V6", "Automatic", "4WD", "SUV"],
  ["2022-porsche-cayenne-coupe-iaai-42781045", "2022 Porsche Cayenne Coupe", "Porsche", "Cayenne", "Coupe", "IAAI", "42781045", "WP1BA2AY8NDA81045", 2022, 23100, 41900, 22300, "Front End", "Newark", "NJ", "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=84", "Black", "3.0L V6 Turbo", "Automatic", "AWD", "SUV"],
  ["2020-lexus-rx-350-copart-66730982", "2020 Lexus RX 350", "Lexus", "RX", "350", "COPART", "66730982", "2T2HZMDA9LC130982", 2020, 8900, 16200, 51180, "Side", "Orlando", "FL", "https://images.unsplash.com/photo-1621993202323-f438eec934ff?auto=format&fit=crop&w=1600&q=84", "Pearl", "3.5L V6", "Automatic", "AWD", "SUV"],
  ["2021-ford-f150-lariat-iaai-40192754", "2021 Ford F-150 Lariat", "Ford", "F-150", "Lariat", "IAAI", "40192754", "1FTFW1ED9MFC92754", 2021, 14200, null, 60950, "Left Side", "Dallas", "TX", "https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?auto=format&fit=crop&w=1600&q=84", "Blue", "3.5L PowerBoost", "Automatic", "4WD", "Pickup"],
  ["2022-chevrolet-tahoe-lt-copart-54817330", "2022 Chevrolet Tahoe LT", "Chevrolet", "Tahoe", "LT", "COPART", "54817330", "1GNSKNKD8NR317330", 2022, 18600, 32800, 33400, "Water/Flood", "Tampa", "FL", "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1600&q=84", "Black", "5.3L V8", "Automatic", "4WD", "SUV"],
  ["2021-dodge-charger-rt-iaai-43102876", "2021 Dodge Charger R/T", "Dodge", "Charger", "R/T", "IAAI", "43102876", "2C3CDXCT7MH602876", 2021, 9750, 18500, 39260, "Front End", "Phoenix", "AZ", "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1600&q=84", "Orange", "5.7L V8", "Automatic", "RWD", "Sedan"],
] as const;

export const mockVehicles: VehicleData[] = records.map((row, index) => {
  const [slug, title, make, model, trim, platform, lotNumber, vin, year, currentBid, buyNowPrice, odometerMiles, primaryDamage, city, state, image, color, engine, transmission, drive, bodyStyle] = row;
  return {
    id: `demo-${index + 1}`,
    slug,
    title,
    make,
    model,
    trim,
    platform,
    lotNumber,
    vin,
    year,
    currentBid,
    buyNowPrice,
    odometerMiles,
    odometerKm: Math.round(odometerMiles * 1.60934),
    primaryDamage,
    city,
    state,
    color,
    engine,
    transmission,
    drive,
    bodyStyle,
    vehicleType: bodyStyle === "Pickup" ? "TRUCK" : "AUTOMOBILE",
    fuel: make === "Tesla" ? "Electric" : "Gasoline",
    keysAvailable: true,
    runCondition: index % 4 === 0 ? "Stationary" : "RUNS AND DRIVES",
    auctionDate: daysFromNow((index % 6) + 1),
    auctionStatus: "Open",
    seller: index % 2 ? "Insurance company" : "Dealer",
    sellerType: index % 2 ? "insurance" : "dealer",
    facility: `${city} auction facility`,
    zip: null,
    saleDocument: index % 3 === 0 ? "Salvage Certificate" : "Certificate of Title",
    titleType: index % 3 === 0 ? "salvage" : "clean",
    sourceUrl: null,
    isDemo: true,
    isActive: true,
    rawData: { demo: true },
    lastSyncedAt: new Date(),
    photos: [
      { url: image, alt: `${title} — демонстраційне фото`, position: 0 },
      { url: image, alt: `${title} — додатковий ракурс`, position: 1 },
    ],
  } satisfies VehicleData;
});
