const dummyLocations = [
  // Cluster A: Marylebone, London - 6 locations
  {
    clusterId: 1,
    postcode: "W1U 3BW",
    address: "12 Baker Street, Marylebone, London W1U 3BW, United Kingdom",
  },
  {
    clusterId: 1,
    postcode: "W1U 1AT",
    address: "10 Duke Street, Marylebone, London W1U 1AT, United Kingdom",
  },
  {
    clusterId: 1,
    postcode: "W1H 1BT",
    address: "Harley House, Marylebone Road, London W1H 1BT, United Kingdom",
  },
  {
    clusterId: 1,
    postcode: "NW1 5HG",
    address: "York Gate, Marylebone Road, London NW1 5HG, United Kingdom",
  },
  {
    clusterId: 1,
    postcode: "W1B 1AD",
    address: "Park Crescent East, London W1B 1AD, United Kingdom",
  },
  {
    clusterId: 1,
    postcode: "W1G 9QR",
    address: "95 George Street, Marylebone, London W1G 9QR, United Kingdom",
  },
  // Cluster B: Fallowfield, Manchester - 5 locations
  {
    clusterId: 2,
    postcode: "M14 5RT",
    address: "48 Kingfisher Way, Fallowfield, Manchester M14 5RT, United Kingdom",
  },
  {
    clusterId: 2,
    postcode: "M14 6GA",
    address: "100 Moseley Road, Fallowfield, Manchester M14 6GA, United Kingdom",
  },
  {
    clusterId: 2,
    postcode: "M14 6ZT",
    address: "Opal Court, 140 Moseley Road, Fallowfield, Manchester M14 6ZT, United Kingdom",
  },
  {
    clusterId: 2,
    postcode: "M14 6SY",
    address: "50 Park View Road, Fallowfield, Manchester M14 6SY, United Kingdom",
  },
  {
    clusterId: 2,
    postcode: "M14 7DZ",
    address: "20 Rostherne Avenue, Fallowfield, Manchester M14 7DZ, United Kingdom",
  },
  // Cluster C: Edgbaston, Birmingham - 7 locations
  {
    clusterId: 3,
    postcode: "B15 3LL",
    address: "27 Oakwood Drive, Edgbaston, Birmingham B15 3LL, United Kingdom",
  },
  {
    clusterId: 3,
    postcode: "B15 2FQ",
    address: "10 Arthur Road, Edgbaston, Birmingham B15 2FQ, United Kingdom",
  },
  {
    clusterId: 3,
    postcode: "B15 3SZ",
    address: "29 Oakwood Drive, Edgbaston, Birmingham B15 3SZ, United Kingdom",
  },
  {
    clusterId: 3,
    postcode: "B16 8HY",
    address: "5 Beaufort Road, Edgbaston, Birmingham B16 8HY, United Kingdom",
  },
  {
    clusterId: 3,
    postcode: "B15 1QJ",
    address: "15 Calthorpe Road, Edgbaston, Birmingham B15 1QJ, United Kingdom",
  },
  {
    clusterId: 3,
    postcode: "B15 2GG",
    address: "Aston Webb Boulevard, Edgbaston, Birmingham B15 2GG, United Kingdom",
  },
  {
    clusterId: 3,
    postcode: "B15 2LH",
    address: "Warwick Crest, 12 Arthur Road, Edgbaston, Birmingham B15 2LH, United Kingdom",
  },
  // Cluster D: Hunslet, Leeds - 4 locations
  {
    clusterId: 4,
    postcode: "LS10 1NH",
    address: "5 Riverside Court, Hunslet, Leeds LS10 1NH, United Kingdom",
  },
  {
    clusterId: 4,
    postcode: "LS10 1BR",
    address: "10 Sardinia Street, Hunslet, Leeds LS10 1BR, United Kingdom",
  },
  {
    clusterId: 4,
    postcode: "LS10 1LA",
    address: "20 Sayner Road, Hunslet, Leeds LS10 1LA, United Kingdom",
  },
  {
    clusterId: 4,
    postcode: "LS10 1BL",
    address: "15 Severn Road, Hunslet, Leeds LS10 1BL, United Kingdom",
  },
  // Cluster E: Clifton, Bristol - 8 locations
  {
    clusterId: 5,
    postcode: "BS8 3JL",
    address: "92 Clifton Avenue, Clifton, Bristol BS8 3JL, United Kingdom",
  },
  {
    clusterId: 5,
    postcode: "BS8 2DD",
    address: "10 Alexandra Road, Clifton, Bristol BS8 2DD, United Kingdom",
  },
  {
    clusterId: 5,
    postcode: "BS8 2BY",
    address: "5 Alma Road, Clifton, Bristol BS8 2BY, United Kingdom",
  },
  {
    clusterId: 5,
    postcode: "BS8 2SR",
    address: "Apsley Mews, 15 Apsley Road, Clifton, Bristol BS8 2SR, United Kingdom",
  },
  {
    clusterId: 5,
    postcode: "BS8 2TR",
    address: "20 Beaconsfield Road, Clifton, Bristol BS8 2TR, United Kingdom",
  },
  {
    clusterId: 5,
    postcode: "BS8 2JR",
    address: "8 Beaufort Road, Clifton, Bristol BS8 2JR, United Kingdom",
  },
  {
    clusterId: 5,
    postcode: "BS8 4TG",
    address: "Bellevue Cottages, 5 Goldney Lane, Clifton, Bristol BS8 4TG, United Kingdom",
  },
  {
    clusterId: 5,
    postcode: "BS8 4JH",
    address: "22 Regent Street, Clifton, Bristol BS8 4JH, United Kingdom",
  },
  // Additional unassigned locations (kept as original, with unique addresses)
  {
    clusterId: null,
    postcode: "S10 2QT",
    address: "14 Westbourne Road, Broomhill, Sheffield S10 2QT, United Kingdom",
  },
  {
    clusterId: null,
    postcode: "L18 2EE",
    address: "33 Hazelwood Lane, Mossley Hill, Liverpool L18 2EE, United Kingdom",
  },
  {
    clusterId: null,
    postcode: "NG3 5DF",
    address: "81 Elmhurst Street, Mapperley, Nottingham NG3 5DF, United Kingdom",
  },
  {
    clusterId: null,
    postcode: "EH8 9AU",
    address: "22 Castle View, Newington, Edinburgh EH8 9AU, United Kingdom",
  },
  {
    clusterId: null,
    postcode: "G42 8DQ",
    address: "9 Queens Park Terrace, Queens Park, Glasgow G42 8DQ, United Kingdom",
  },
];

export default dummyLocations;