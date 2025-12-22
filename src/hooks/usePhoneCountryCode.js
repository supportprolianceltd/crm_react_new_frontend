// hooks/usePhoneCountryCode.js
import { useState, useEffect } from "react";

const countriesData = [
  {
    "name": {
      "common": "Nigeria",
      "official": "Federal Republic of Nigeria",
      "nativeName": {
        "eng": {
          "official": "Federal Republic of Nigeria",
          "common": "Nigeria"
        }
      }
    },
    "idd": {
      "root": "+2",
      "suffixes": [
        "34"
      ]
    }
  },
  {
    "name": {
      "common": "United States",
      "official": "United States of America",
      "nativeName": {
        "eng": {
          "official": "United States of America",
          "common": "United States"
        }
      }
    },
    "idd": {
      "root": "+1",
      "suffixes": [
        "201",
        "202",
        "203",
        "205",
        "206",
        "207",
        "208",
        "209",
        "210",
        "212",
        "213",
        "214",
        "215",
        "216",
        "217",
        "218",
        "219",
        "220",
        "224",
        "225",
        "227",
        "228",
        "229",
        "231",
        "234",
        "239",
        "240",
        "248",
        "251",
        "252",
        "253",
        "254",
        "256",
        "260",
        "262",
        "267",
        "269",
        "270",
        "272",
        "274",
        "276",
        "281",
        "283",
        "301",
        "302",
        "303",
        "304",
        "305",
        "307",
        "308",
        "309",
        "310",
        "312",
        "313",
        "314",
        "315",
        "316",
        "317",
        "318",
        "319",
        "320",
        "321",
        "323",
        "325",
        "327",
        "330",
        "331",
        "334",
        "336",
        "337",
        "339",
        "346",
        "347",
        "351",
        "352",
        "360",
        "361",
        "364",
        "380",
        "385",
        "386",
        "401",
        "402",
        "404",
        "405",
        "406",
        "407",
        "408",
        "409",
        "410",
        "412",
        "413",
        "414",
        "415",
        "417",
        "419",
        "423",
        "424",
        "425",
        "430",
        "432",
        "434",
        "435",
        "440",
        "442",
        "443",
        "447",
        "458",
        "463",
        "464",
        "469",
        "470",
        "475",
        "478",
        "479",
        "480",
        "484",
        "501",
        "502",
        "503",
        "504",
        "505",
        "507",
        "508",
        "509",
        "510",
        "512",
        "513",
        "515",
        "516",
        "517",
        "518",
        "520",
        "530",
        "531",
        "534",
        "539",
        "540",
        "541",
        "551",
        "559",
        "561",
        "562",
        "563",
        "564",
        "567",
        "570",
        "571",
        "573",
        "574",
        "575",
        "580",
        "585",
        "586",
        "601",
        "602",
        "603",
        "605",
        "606",
        "607",
        "608",
        "609",
        "610",
        "612",
        "614",
        "615",
        "616",
        "617",
        "618",
        "619",
        "620",
        "623",
        "626",
        "628",
        "629",
        "630",
        "631",
        "636",
        "641",
        "646",
        "650",
        "651",
        "657",
        "660",
        "661",
        "662",
        "667",
        "669",
        "678",
        "681",
        "682",
        "701",
        "702",
        "703",
        "704",
        "706",
        "707",
        "708",
        "712",
        "713",
        "714",
        "715",
        "716",
        "717",
        "718",
        "719",
        "720",
        "724",
        "725",
        "727",
        "730",
        "731",
        "732",
        "734",
        "737",
        "740",
        "743",
        "747",
        "754",
        "757",
        "760",
        "762",
        "763",
        "765",
        "769",
        "770",
        "772",
        "773",
        "774",
        "775",
        "779",
        "781",
        "785",
        "786",
        "801",
        "802",
        "803",
        "804",
        "805",
        "806",
        "808",
        "810",
        "812",
        "813",
        "814",
        "815",
        "816",
        "817",
        "818",
        "828",
        "830",
        "831",
        "832",
        "843",
        "845",
        "847",
        "848",
        "850",
        "854",
        "856",
        "857",
        "858",
        "859",
        "860",
        "862",
        "863",
        "864",
        "865",
        "870",
        "872",
        "878",
        "901",
        "903",
        "904",
        "906",
        "907",
        "908",
        "909",
        "910",
        "912",
        "913",
        "914",
        "915",
        "916",
        "917",
        "918",
        "919",
        "920",
        "925",
        "928",
        "929",
        "930",
        "931",
        "934",
        "936",
        "937",
        "938",
        "940",
        "941",
        "947",
        "949",
        "951",
        "952",
        "954",
        "956",
        "959",
        "970",
        "971",
        "972",
        "973",
        "975",
        "978",
        "979",
        "980",
        "984",
        "985",
        "989"
      ]
    }
  },
  {
    "name": {
      "common": "United Kingdom",
      "official": "United Kingdom of Great Britain and Northern Ireland",
      "nativeName": {
        "eng": {
          "official": "United Kingdom of Great Britain and Northern Ireland",
          "common": "United Kingdom"
        }
      }
    },
    "idd": {
      "root": "+4",
      "suffixes": [
        "4"
      ]
    }
  }
];

export const usePhoneCountryCode = (initialCode = "+234") => {
  const [countryCode, setCountryCode] = useState(initialCode);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
      let countryOptions = countriesData
        .filter(
          (country) =>
            country.idd && country.idd.root && country.idd.root !== ""
        )
        .map((country) => {
          let fullCode = country.idd.root;
          const suffixes = country.idd.suffixes || [];
          if (fullCode !== "+1" && suffixes.length > 0) {
            fullCode += suffixes[0];
          }
          return {
            value: fullCode,
            label: `${fullCode} (${country.name.common})`,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));

      // Move Nigeria (+234) to the front
      const nigeriaIndex = countryOptions.findIndex(option => option.value === "+234");
      if (nigeriaIndex > -1) {
        const nigeriaOption = countryOptions.splice(nigeriaIndex, 1)[0];
        countryOptions.unshift(nigeriaOption);
      }
      setOptions(countryOptions);
      // Set initial code if it exists in options
      const initialOption = countryOptions.find(
        (opt) => opt.value === initialCode
      );
      if (initialOption) {
        setCountryCode(initialCode);
      } else if (countryOptions.length > 0) {
        setCountryCode(countryOptions[0].value);
      }
    } catch (err) {
      console.error("Error processing country codes:", err);
      setError(err.message);
      // Fallback to hardcoded options
      const fallbackOptions = [
        { value: "+1", label: "+1 (United States)" },
        { value: "+44", label: "+44 (United Kingdom)" },
        { value: "+234", label: "+234 (Nigeria)" },
        { value: "+91", label: "+91 (India)" },
        { value: "+86", label: "+86 (China)" },
      ];
      setOptions(fallbackOptions);
      const fallbackInitial =
        fallbackOptions.find((opt) => opt.value === initialCode) ||
        fallbackOptions[0];
      setCountryCode(fallbackInitial.value);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    countryCode,
    setCountryCode,
    options,
    loading,
    error,
  };
};
