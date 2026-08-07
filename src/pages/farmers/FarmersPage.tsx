import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import LocationPicker from "../../components/maps/LocationPicker";

import {
  getFarmers,
  createFarmer,
  updateFarmer,
  deleteFarmer,
} from "../../services/farmerService";
import { useAuth } from "../../context/AuthContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  MapContainer,
  Marker,
  Popup,
  Tooltip,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
delete (L.Icon.Default.prototype as any)
  ._getIconUrl;

  import { useMap } from "react-leaflet";
  import {

createFarmMarker,

getFarmIcon,

} from "../../utils/mapMarkers";
import MapLayers from "../../components/maps/MapLayers";
import { useRef } from "react";
import { MapPin } from "lucide-react";
import ExcelJS from "exceljs";

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


export default function FarmersPage() {
  const { role } = useAuth();

if (role === "viewer") {
  return (
    <div className="p-6">
      Access Denied
    </div>
  );
}
  const [farmers, setFarmers] =
    useState<any[]>([]);

  const [companies, setCompanies] =
    useState<any[]>([]);

  const [agents, setAgents] =
    useState<any[]>([]);
  
  const [filteredAgents,
  setFilteredAgents] =
  useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [selectedFarmer, setSelectedFarmer] =
    useState<any>(null);

    const [showMap, setShowMap] =
  useState(false);
const [form, setForm] =
  useState({
    company_id: "",
    agent_id: "",

    farmer_name: "",
    mobile: "",

    village: "",
    union_name: "",
    upazila: "",
    district: "Mymensingh",

    // New
    farm_category: "",

    // Poultry
    broiler: "",
    layer: "",
    sonali: "",
    duck: "",
    quail: "",
    deshi_chicken: "",

    // Cattle
    dairy_cow: "",
    bull: "",
    calf_heifer: "",

    // Fish
    pangus: "",
    tilapia: "",
    koi: "",
    shing: "",
    pabda: "",
    gulsha: "",
    magur: "",
    carp: "",
    golda: "",
    bagda: "",
    tengra: "",

    feed_type: "",

    latitude: "",
    longitude: "",

    status: "Active",

    remarks: "",
  });

    const [companyFilter, setCompanyFilter] =
  useState("");

const [agentFilter, setAgentFilter] =
  useState("");

const [districtFilter, setDistrictFilter] = useState("Mymensingh");

const [upazilaFilter, setUpazilaFilter] =
  useState("");

const [unionFilter, setUnionFilter] =
  useState("");

const [showForm, setShowForm] =
  useState(false);

  const [districts, setDistricts] =
  useState<any[]>([]);

const [upazilas, setUpazilas] =
  useState<any[]>([]);

const [unions, setUnions] =
  useState<any[]>([]);

  const [showFarmerMap,
setShowFarmerMap] =
useState(false);

const [showExportMenu, setShowExportMenu] = useState(false);


  const [showSummary,
setShowSummary] =
useState(false);

const [farmCategoryFilter, setFarmCategoryFilter] = useState("");

const [myLocationMode,
setMyLocationMode] =
useState(false);

const [
  selectedFarmerPosition,
  setSelectedFarmerPosition,
] = useState<
  [number, number] | null
>(null);

const farmerMarkerRefs = useRef<
  Record<number, L.Marker | null>
>({});

const [myPosition,
setMyPosition] =
useState<
  [number, number] | null
>(null);

const [filterUpazilas, setFilterUpazilas] =
  useState<any[]>([]);

const [filterUnions, setFilterUnions] =
  useState<any[]>([]);





  function clearFilters() {
  setCompanyFilter("");
  setAgentFilter("");
  setDistrictFilter("");
  setUpazilaFilter("");
  setUnionFilter("");
  setFarmCategoryFilter("");
  setSearch("");
}



  async function loadData() {
    const farmerData =
      await getFarmers();

    setFarmers(farmerData || []);

    const { data: companyData } =
      await supabase
        .from("companies")
        .select("*")
        .order("company_name");

    setCompanies(
      companyData || []
    );

    const { data: agentData } =
      await supabase
        .from("agents")
        .select("*")
        .order("agent_name");

    setAgents(agentData || []);

    const { data: districtData } =
  await supabase
    .from("districts")
    .select("*")
    .order("name");

setDistricts(
  districtData || []
);
  }
  

  useEffect(() => {
    loadData();
  }, []);


  async function handleSave() {

    if (
  !form.company_id ||
  !form.agent_id ||
  !form.farmer_name.trim() ||
  !form.farm_category
) {
  alert(
    "Company, Agent, Farmer Name and Farm Category are required"
  );
  return;
}
      
    const payload = {
      ...form,

      company_id:
        Number(
          form.company_id
        ),

      agent_id:
        Number(
          form.agent_id
        ),

      latitude:
        form.latitude === ""
          ? null
          : Number(
              form.latitude
            ),

      longitude:
        form.longitude === ""
          ? null
          : Number(
              form.longitude
            ),

                  // Poultry
      broiler: Number(form.broiler || 0),
      layer: Number(form.layer || 0),
      sonali: Number(form.sonali || 0),
      duck: Number(form.duck || 0),
      quail: Number(form.quail || 0),
      deshi_chicken: Number(form.deshi_chicken || 0),

      // Cattle
      dairy_cow: Number(form.dairy_cow || 0),
      bull: Number(form.bull || 0),
      calf_heifer: Number(form.calf_heifer || 0),

      // Fish
      pangus: Number(form.pangus || 0),
      tilapia: Number(form.tilapia || 0),
      koi: Number(form.koi || 0),
      shing: Number(form.shing || 0),
      pabda: Number(form.pabda || 0),
      gulsha: Number(form.gulsha || 0),
      magur: Number(form.magur || 0),
      carp: Number(form.carp || 0),
      golda: Number(form.golda || 0),
      bagda: Number(form.bagda || 0),
      tengra: Number(form.tengra || 0),
    };


    if (editingId) {
      await updateFarmer(
        editingId,
        payload as any
      );

      alert(
        "Farmer Updated"
      );
    } else {
      await createFarmer(
        payload as any
      );

      alert(
        "Farmer Saved"
      );
    }

    setEditingId(null);

    setForm({
       company_id: "",
    agent_id: "",

    farmer_name: "",
    mobile: "",

    village: "",
    union_name: "",
    upazila: "",
    district: "Mymensingh",

    // New
    farm_category: "",

    // Poultry
    broiler: "",
    layer: "",
    sonali: "",
    duck: "",
    quail: "",
    deshi_chicken: "",

    // Cattle
    dairy_cow: "",
    bull: "",
    calf_heifer: "",

    // Fish
    pangus: "",
    tilapia: "",
    koi: "",
    shing: "",
    pabda: "",
    gulsha: "",
    magur: "",
    carp: "",
    golda: "",
    bagda: "",
    tengra: "",

    feed_type: "",

    latitude: "",
    longitude: "",

    status: "Active",

    remarks: "",
    });

    setShowForm(false);

    loadData();
  }

  async function handleDelete(
    id: number
  ) {
    const ok =
      confirm(
        "Delete Farmer?"
      );

    if (!ok) return;

    await deleteFarmer(id);

    loadData();
  }


  function RecenterMap({
  position,
}: {
  position: [number, number];
}) {

  const map = useMap();

  useEffect(() => {

    if (!position) return;

    map.flyTo(position, 18, {
      animate: true,
      duration: 1.5,
    });
    map.once("moveend", () => {
  // animation শেষ
});

  }, [position, map]);

  return null;
}




  function FitBounds({
  positions,
}: {
  positions: [number, number][];
}) {

  const map = useMap();

  useEffect(() => {

    if (positions.length === 0) return;

    map.fitBounds(
      positions,
      {
        padding: [50, 50],
      }
    );

  }, [positions, map]);

  return null;
}


// Export All Farmers to Excel
// ==================================================
// EXPORT ALL FARMERS EXCEL
// ==================================================

async function exportAllFarmersExcel() {

  try {

    // ==================================================
    // IMPORT
    // ==================================================

    const ExcelJS =
      await import("exceljs");

    const workbook =
      new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet(
        "All Farmers"
      );


    // ==================================================
    // FILTER FARMERS
    // ==================================================

    const filteredFarmers =
      farmers.filter((f: any) => {

        const matchSearch =
          f.farmer_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchCompany =
          companyFilter === "" ||
          String(
            f.company_id
          ) === companyFilter;

        const matchAgent =
          agentFilter === "" ||
          String(
            f.agent_id
          ) === agentFilter;

        const matchDistrict =
          districtFilter === "" ||
          f.district ===
            districtFilter;

        const matchUpazila =
          upazilaFilter === "" ||
          f.upazila ===
            upazilaFilter;

        const matchUnion =
          unionFilter === "" ||
          f.union_name ===
            unionFilter;

        const matchFarmCategory =
          farmCategoryFilter === "" ||
          f.farm_category ===
            farmCategoryFilter;

        return (
          matchSearch &&
          matchCompany &&
          matchAgent &&
          matchDistrict &&
          matchUpazila &&
          matchUnion &&
          matchFarmCategory
        );

      });


    // ==================================================
    // FREEZE HEADER
    // ==================================================

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 2,
      },
    ];


    // ==================================================
    // GENERAL HEADERS
    // ==================================================

    const generalHeaders = [
      "Company",
      "Agent",
      "Farmer",
      "Mobile",
      "Village",
      "Union",
      "Upazila",
      "District",
      "Farm Category",
    ];


    generalHeaders.forEach(
      (header, index) => {

        const col =
          index + 1;

        worksheet.mergeCells(
          1,
          col,
          2,
          col
        );

        const cell =
          worksheet.getCell(
            1,
            col
          );

        cell.value =
          header;

      }
    );


    // ==================================================
    // POULTRY HEADER
    // ==================================================

    worksheet.mergeCells(
      "J1:O1"
    );

    worksheet.getCell(
      "J1"
    ).value =
      "POULTRY";


    worksheet.getCell(
      "J2"
    ).value =
      "Broiler";

    worksheet.getCell(
      "K2"
    ).value =
      "Layer";

    worksheet.getCell(
      "L2"
    ).value =
      "Sonali";

    worksheet.getCell(
      "M2"
    ).value =
      "Duck";

    worksheet.getCell(
      "N2"
    ).value =
      "Quail";

    worksheet.getCell(
      "O2"
    ).value =
      "Deshi Chicken";


    // ==================================================
    // CATTLE HEADER
    // ==================================================

    worksheet.mergeCells(
      "P1:R1"
    );

    worksheet.getCell(
      "P1"
    ).value =
      "CATTLE";


    worksheet.getCell(
      "P2"
    ).value =
      "Dairy Cow";

    worksheet.getCell(
      "Q2"
    ).value =
      "Bull";

    worksheet.getCell(
      "R2"
    ).value =
      "Calf / Heifer";


    // ==================================================
    // FISH HEADER
    // ==================================================

    worksheet.mergeCells(
      "S1:AC1"
    );

    worksheet.getCell(
      "S1"
    ).value =
      "FISH";


    worksheet.getCell(
      "S2"
    ).value =
      "Pangus";

    worksheet.getCell(
      "T2"
    ).value =
      "Tilapia";

    worksheet.getCell(
      "U2"
    ).value =
      "Koi";

    worksheet.getCell(
      "V2"
    ).value =
      "Shing";

    worksheet.getCell(
      "W2"
    ).value =
      "Pabda";

    worksheet.getCell(
      "X2"
    ).value =
      "Gulsha";

    worksheet.getCell(
      "Y2"
    ).value =
      "Magur";

    worksheet.getCell(
      "Z2"
    ).value =
      "Carp";

    worksheet.getCell(
      "AA2"
    ).value =
      "Golda";

    worksheet.getCell(
      "AB2"
    ).value =
      "Bagda";

    worksheet.getCell(
      "AC2"
    ).value =
      "Tengra";


    // ==================================================
    // FEED + STATUS
    // ==================================================

    worksheet.mergeCells(
      "AD1:AD2"
    );

    worksheet.getCell(
      "AD1"
    ).value =
      "Feed Type";


    worksheet.mergeCells(
      "AE1:AE2"
    );

    worksheet.getCell(
      "AE1"
    ).value =
      "Status";


    // ==================================================
    // HEADER STYLE
    // ==================================================

    // General headers
    for (
      let col = 1;
      col <= 9;
      col++
    ) {

      const cell =
        worksheet.getCell(
          1,
          col
        );

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "1E3A8A",
        },
      };

      cell.font = {
        bold: true,
        color: {
          argb: "FFFFFFFF",
        },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

    }


    // ==================================================
    // POULTRY MAIN HEADER
    // ==================================================

    const poultryHeader =
      worksheet.getCell(
        "J1"
      );

    poultryHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "D97706",
      },
    };

    poultryHeader.font = {
      bold: true,
      color: {
        argb: "FFFFFFFF",
      },
    };

    poultryHeader.alignment = {
      horizontal: "center",
      vertical: "middle",
    };


    // Poultry subheaders
    for (
      let col = 10;
      col <= 15;
      col++
    ) {

      const cell =
        worksheet.getCell(
          2,
          col
        );

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FEF3C7",
        },
      };

      cell.font = {
        bold: true,
        color: {
          argb: "92400E",
        },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

    }


    // ==================================================
    // CATTLE MAIN HEADER
    // ==================================================

    const cattleHeader =
      worksheet.getCell(
        "P1"
      );

    cattleHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "15803D",
      },
    };

    cattleHeader.font = {
      bold: true,
      color: {
        argb: "FFFFFFFF",
      },
    };

    cattleHeader.alignment = {
      horizontal: "center",
      vertical: "middle",
    };


    // Cattle subheaders
    for (
      let col = 16;
      col <= 18;
      col++
    ) {

      const cell =
        worksheet.getCell(
          2,
          col
        );

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "DCFCE7",
        },
      };

      cell.font = {
        bold: true,
        color: {
          argb: "166534",
        },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

    }


    // ==================================================
    // FISH MAIN HEADER
    // ==================================================

    const fishHeader =
      worksheet.getCell(
        "S1"
      );

    fishHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "0284C7",
      },
    };

    fishHeader.font = {
      bold: true,
      color: {
        argb: "FFFFFFFF",
      },
    };

    fishHeader.alignment = {
      horizontal: "center",
      vertical: "middle",
    };


    // Fish subheaders
    for (
      let col = 19;
      col <= 29;
      col++
    ) {

      const cell =
        worksheet.getCell(
          2,
          col
        );

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "E0F2FE",
        },
      };

      cell.font = {
        bold: true,
        color: {
          argb: "075985",
        },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

    }


    // ==================================================
    // FEED + STATUS HEADER STYLE
    // ==================================================

    for (
      let col = 30;
      col <= 31;
      col++
    ) {

      const cell =
        worksheet.getCell(
          1,
          col
        );

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "1E3A8A",
        },
      };

      cell.font = {
        bold: true,
        color: {
          argb: "FFFFFFFF",
        },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

    }


    // ==================================================
    // HEADER BORDERS
    // ==================================================

    for (
      let row = 1;
      row <= 2;
      row++
    ) {

      for (
        let col = 1;
        col <= 31;
        col++
      ) {

        worksheet
          .getCell(
            row,
            col
          )
          .border = {

          top: {
            style: "thin",
            color: {
              argb: "CBD5E1",
            },
          },

          left: {
            style: "thin",
            color: {
              argb: "CBD5E1",
            },
          },

          bottom: {
            style: "thin",
            color: {
              argb: "CBD5E1",
            },
          },

          right: {
            style: "thin",
            color: {
              argb: "CBD5E1",
            },
          },

        };

      }

    }


    // ==================================================
    // ADD FARMER DATA
    // ==================================================

    filteredFarmers.forEach(
      (farmer: any) => {

        const row =
          worksheet.addRow([

            // General
            farmer.companies
              ?.company_name || "",

            farmer.agents
              ?.agent_name || "",

            farmer.farmer_name || "",

            farmer.mobile || "",

            farmer.village || "",

            farmer.union_name || "",

            farmer.upazila || "",

            farmer.district || "",

            farmer.farm_category || "",


            // Poultry
            Number(
              farmer.broiler || 0
            ),

            Number(
              farmer.layer || 0
            ),

            Number(
              farmer.sonali || 0
            ),

            Number(
              farmer.duck || 0
            ),

            Number(
              farmer.quail || 0
            ),

            Number(
              farmer.deshi_chicken || 0
            ),


            // Cattle
            Number(
              farmer.dairy_cow || 0
            ),

            Number(
              farmer.bull || 0
            ),

            Number(
              farmer.calf_heifer || 0
            ),


            // Fish
            Number(
              farmer.pangus || 0
            ),

            Number(
              farmer.tilapia || 0
            ),

            Number(
              farmer.koi || 0
            ),

            Number(
              farmer.shing || 0
            ),

            Number(
              farmer.pabda || 0
            ),

            Number(
              farmer.gulsha || 0
            ),

            Number(
              farmer.magur || 0
            ),

            Number(
              farmer.carp || 0
            ),

            Number(
              farmer.golda || 0
            ),

            Number(
              farmer.bagda || 0
            ),

            Number(
              farmer.tengra || 0
            ),


            // LAST
            farmer.feed_type || "",

            farmer.status || "",

          ]);


        // ==================================================
        // DATA STYLE
        // ==================================================

        row.eachCell(
          (cell) => {

            cell.border = {

              top: {
                style: "thin",
                color: {
                  argb: "D1D5DB",
                },
              },

              left: {
                style: "thin",
                color: {
                  argb: "D1D5DB",
                },
              },

              bottom: {
                style: "thin",
                color: {
                  argb: "D1D5DB",
                },
              },

              right: {
                style: "thin",
                color: {
                  argb: "D1D5DB",
                },
              },

            };

            cell.alignment = {
              vertical: "middle",
              wrapText: true,
            };

          }
        );

      }
    );


    // ==================================================
    // ROW HEIGHT
    // ==================================================

    worksheet.getRow(
      1
    ).height = 26;

    worksheet.getRow(
      2
    ).height = 30;


    // ==================================================
    // COLUMN WIDTHS
    // ==================================================

    const widths = [

      // General
      22, // Company
      20, // Agent
      22, // Farmer
      15, // Mobile
      18, // Village
      18, // Union
      18, // Upazila
      18, // District
      18, // Farm Category

      // Poultry
      12, // Broiler
      12, // Layer
      12, // Sonali
      12, // Duck
      12, // Quail
      16, // Deshi Chicken

      // Cattle
      14, // Dairy Cow
      12, // Bull
      16, // Calf / Heifer

      // Fish
      12, // Pangus
      12, // Tilapia
      12, // Koi
      12, // Shing
      12, // Pabda
      12, // Gulsha
      12, // Magur
      12, // Carp
      12, // Golda
      12, // Bagda
      12, // Tengra

      // Last
      18, // Feed Type
      12, // Status

    ];


    widths.forEach(
      (width, index) => {

        worksheet.getColumn(
          index + 1
        ).width = width;

      }
    );


    // ==================================================
    // PRINT SETTINGS
    // ==================================================

    worksheet.pageSetup.orientation =
      "landscape";

    worksheet.pageSetup.fitToPage =
      true;

    worksheet.pageSetup.fitToWidth =
      1;

    worksheet.pageSetup.fitToHeight =
      0;

    worksheet.pageSetup.paperSize = 9;


    // ==================================================
    // AUTO FILTER
    // ==================================================

    worksheet.autoFilter = {
      from: "A2",
      to: "AE2",
    };


    // ==================================================
    // EXPORT
    // ==================================================

    const buffer =
      await workbook.xlsx.writeBuffer();

    const blob =
      new Blob(
        [buffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

    saveAs(
      blob,
      `All_Farmers_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );


  } catch (error) {

    console.error(
      "Excel Export Error:",
      error
    );

    alert(
      "Excel export failed. Please check the browser console."
    );

  }

}




// Export Poultry Farmers to Excel

async function exportPoultryExcel() {
  try {

    const workbook = new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet("Poultry Farmers");

    // ==================================================
    // FILTER POULTRY
    // ==================================================

    const poultryFarmers =
      farmers.filter(
        (farmer: any) =>
          farmer.farm_category === "Poultry"
      );


    // ==================================================
    // HEADER
    // ==================================================

    worksheet.addRow([
      "Company",
      "Agent",
      "Farmer",
      "Mobile",
      "Village",
      "Union",
      "Upazila",
      "District",

      "Farm Category",

      "Broiler",
      "Layer",
      "Sonali",
      "Duck",
      "Quail",
      "Deshi Chicken",

      "Feed Type",
      "Latitude",
      "Longitude",
      "Status",
      "Remarks",
    ]);


    // ==================================================
    // DATA
    // ==================================================

    poultryFarmers.forEach(
      (farmer: any) => {

        worksheet.addRow([

          farmer.companies?.company_name || "",

          farmer.agents?.agent_name || "",

          farmer.farmer_name || "",

          farmer.mobile || "",

          farmer.village || "",

          farmer.union_name || "",

          farmer.upazila || "",

          farmer.district || "",

          farmer.farm_category || "",

          Number(farmer.broiler || 0),

          Number(farmer.layer || 0),

          Number(farmer.sonali || 0),

          Number(farmer.duck || 0),

          Number(farmer.quail || 0),

          Number(
            farmer.deshi_chicken || 0
          ),

          farmer.feed_type || "",

          farmer.latitude ?? "",

          farmer.longitude ?? "",

          farmer.status || "",

          farmer.remarks || "",

        ]);

      }
    );


    // ==================================================
    // HEADER STYLE
    // ==================================================

    worksheet.getRow(1).eachCell(
      (cell) => {

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "D97706",
          },
        };

        cell.font = {
          bold: true,
          color: {
            argb: "FFFFFFFF",
          },
        };

        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };

        cell.border = {
          top: {
            style: "thin",
            color: {
              argb: "FFFFFF",
            },
          },
          left: {
            style: "thin",
            color: {
              argb: "FFFFFF",
            },
          },
          bottom: {
            style: "thin",
            color: {
              argb: "FFFFFF",
            },
          },
          right: {
            style: "thin",
            color: {
              argb: "FFFFFF",
            },
          },
        };

      }
    );


    // ==================================================
    // DATA STYLE
    // ==================================================

    worksheet.eachRow(
      (row, rowNumber) => {

        if (rowNumber > 1) {

          row.eachCell(
            (cell) => {

              cell.border = {
                top: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
                left: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
                bottom: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
                right: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
              };

              cell.alignment = {
                vertical: "middle",
                wrapText: true,
              };

            }
          );

        }

      }
    );


    // ==================================================
    // COLUMN WIDTH
    // ==================================================

    const widths = [
      25, // Company
      22, // Agent
      25, // Farmer
      16, // Mobile
      20, // Village
      20, // Union
      18, // Upazila
      18, // District
      16, // Category

      12, // Broiler
      12, // Layer
      12, // Sonali
      12, // Duck
      12, // Quail
      18, // Deshi Chicken

      18, // Feed
      14, // Latitude
      14, // Longitude
      12, // Status
      30, // Remarks
    ];

    widths.forEach(
      (width, index) => {

        worksheet.getColumn(
          index + 1
        ).width = width;

      }
    );


    worksheet.getRow(1).height = 28;


    // ==================================================
    // FREEZE HEADER
    // ==================================================

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];


    // ==================================================
    // PRINT SETTINGS
    // ==================================================

    worksheet.pageSetup.orientation =
      "landscape";

    worksheet.pageSetup.fitToPage = true;

    worksheet.pageSetup.fitToWidth = 1;

    worksheet.pageSetup.fitToHeight = 0;


    // ==================================================
    // EXPORT
    // ==================================================

    const buffer =
      await workbook.xlsx.writeBuffer();

    const blob =
      new Blob(
        [buffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

    saveAs(
      blob,
      `Poultry_Farmers_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );

  } catch (error) {

    console.error(
      "Poultry Export Error:",
      error
    );

    alert(
      "Poultry export failed. Please check the browser console."
    );

  }
}



// Export Cattle Farmers to Excel

async function exportCattleExcel() {
  try {

    const workbook = new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet("Cattle Farmers");


    // ==================================================
    // FILTER CATTLE
    // ==================================================

    const cattleFarmers =
      farmers.filter(
        (farmer: any) =>
          farmer.farm_category === "Cattle"
      );


    // ==================================================
    // HEADER
    // ==================================================

    worksheet.addRow([
      "Company",
      "Agent",
      "Farmer",
      "Mobile",
      "Village",
      "Union",
      "Upazila",
      "District",

      "Farm Category",

      "Dairy Cow",
      "Bull",
      "Calf / Heifer",
      "Total Cattle",

      "Feed Type",
      "Latitude",
      "Longitude",
      "Status",
      "Remarks",
    ]);


    // ==================================================
    // DATA
    // ==================================================

    cattleFarmers.forEach(
      (farmer: any) => {

        const dairyCow =
          Number(farmer.dairy_cow || 0);

        const bull =
          Number(farmer.bull || 0);

        const calfHeifer =
          Number(
            farmer.calf_heifer || 0
          );

        const totalCattle =
          dairyCow +
          bull +
          calfHeifer;


        worksheet.addRow([

          farmer.companies?.company_name || "",

          farmer.agents?.agent_name || "",

          farmer.farmer_name || "",

          farmer.mobile || "",

          farmer.village || "",

          farmer.union_name || "",

          farmer.upazila || "",

          farmer.district || "",

          farmer.farm_category || "",

          dairyCow,

          bull,

          calfHeifer,

          totalCattle,

          farmer.feed_type || "",

          farmer.latitude ?? "",

          farmer.longitude ?? "",

          farmer.status || "",

          farmer.remarks || "",

        ]);

      }
    );


    // ==================================================
    // HEADER STYLE
    // ==================================================

    worksheet.getRow(1).eachCell(
      (cell) => {

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "15803D",
          },
        };

        cell.font = {
          bold: true,
          color: {
            argb: "FFFFFFFF",
          },
        };

        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };

        cell.border = {
          top: {
            style: "thin",
            color: {
              argb: "FFFFFF",
            },
          },
          left: {
            style: "thin",
            color: {
              argb: "FFFFFF",
            },
          },
          bottom: {
            style: "thin",
            color: {
              argb: "FFFFFF",
            },
          },
          right: {
            style: "thin",
            color: {
              argb: "FFFFFF",
            },
          },
        };

      }
    );


    // ==================================================
    // DATA STYLE
    // ==================================================

    worksheet.eachRow(
      (row, rowNumber) => {

        if (rowNumber > 1) {

          row.eachCell(
            (cell) => {

              cell.border = {
                top: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
                left: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
                bottom: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
                right: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
              };

              cell.alignment = {
                vertical: "middle",
                wrapText: true,
              };

            }
          );

        }

      }
    );


    // ==================================================
    // COLUMN WIDTH
    // ==================================================

    const widths = [
      25,
      22,
      25,
      16,
      20,
      20,
      18,
      18,
      16,

      15, // Dairy Cow
      12, // Bull
      18, // Calf / Heifer
      18, // Total Cattle

      18,
      14,
      14,
      12,
      30,
    ];

    widths.forEach(
      (width, index) => {

        worksheet.getColumn(
          index + 1
        ).width = width;

      }
    );


    worksheet.getRow(1).height = 28;


    // ==================================================
    // FREEZE HEADER
    // ==================================================

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];


    // ==================================================
    // PRINT SETTINGS
    // ==================================================

    worksheet.pageSetup.orientation =
      "landscape";

    worksheet.pageSetup.fitToPage = true;

    worksheet.pageSetup.fitToWidth = 1;

    worksheet.pageSetup.fitToHeight = 0;


    // ==================================================
    // EXPORT
    // ==================================================

    const buffer =
      await workbook.xlsx.writeBuffer();

    const blob =
      new Blob(
        [buffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

    saveAs(
      blob,
      `Cattle_Farmers_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );

  } catch (error) {

    console.error(
      "Cattle Export Error:",
      error
    );

    alert(
      "Cattle export failed. Please check the browser console."
    );

  }
}



// Export Fish Farmers to Excel

async function exportFishExcel() {
  try {

    const workbook = new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet("Fish Farmers");


    // ==================================================
    // FILTER FISH
    // ==================================================

    const fishFarmers =
      farmers.filter(
        (farmer: any) =>
          farmer.farm_category === "Fish"
      );


    // ==================================================
    // HEADER
    // ==================================================

    worksheet.addRow([
      "Company",
      "Agent",
      "Farmer",
      "Mobile",
      "Village",
      "Union",
      "Upazila",
      "District",

      "Farm Category",

      "Pangus",
      "Tilapia",
      "Koi",
      "Shing",
      "Pabda",
      "Gulsha",
      "Magur",
      "Carp",
      "Golda",
      "Bagda",
      "Tengra",

      "Total Fish",

      "Feed Type",
      "Latitude",
      "Longitude",
      "Status",
      "Remarks",
    ]);


    // ==================================================
    // DATA
    // ==================================================

    fishFarmers.forEach(
      (farmer: any) => {

        const pangus =
          Number(farmer.pangus || 0);

        const tilapia =
          Number(farmer.tilapia || 0);

        const koi =
          Number(farmer.koi || 0);

        const shing =
          Number(farmer.shing || 0);

        const pabda =
          Number(farmer.pabda || 0);

        const gulsha =
          Number(farmer.gulsha || 0);

        const magur =
          Number(farmer.magur || 0);

        const carp =
          Number(farmer.carp || 0);

        const golda =
          Number(farmer.golda || 0);

        const bagda =
          Number(farmer.bagda || 0);

        const tengra =
          Number(farmer.tengra || 0);


        const totalFish =
          pangus +
          tilapia +
          koi +
          shing +
          pabda +
          gulsha +
          magur +
          carp +
          golda +
          bagda +
          tengra;


        worksheet.addRow([

          farmer.companies?.company_name || "",

          farmer.agents?.agent_name || "",

          farmer.farmer_name || "",

          farmer.mobile || "",

          farmer.village || "",

          farmer.union_name || "",

          farmer.upazila || "",

          farmer.district || "",

          farmer.farm_category || "",

          pangus,

          tilapia,

          koi,

          shing,

          pabda,

          gulsha,

          magur,

          carp,

          golda,

          bagda,

          tengra,

          totalFish,

          farmer.feed_type || "",

          farmer.latitude ?? "",

          farmer.longitude ?? "",

          farmer.status || "",

          farmer.remarks || "",

        ]);

      }
    );


    // ==================================================
    // HEADER STYLE
    // ==================================================

    worksheet.getRow(1).eachCell(
      (cell) => {

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "0284C7",
          },
        };

        cell.font = {
          bold: true,
          color: {
            argb: "FFFFFFFF",
          },
        };

        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };

        cell.border = {
          top: {
            style: "thin",
            color: {
              argb: "FFFFFF",
            },
          },
          left: {
            style: "thin",
            color: {
              argb: "FFFFFF",
            },
          },
          bottom: {
            style: "thin",
            color: {
              argb: "FFFFFF",
            },
          },
          right: {
            style: "thin",
            color: {
              argb: "FFFFFF",
            },
          },
        };

      }
    );


    // ==================================================
    // DATA STYLE
    // ==================================================

    worksheet.eachRow(
      (row, rowNumber) => {

        if (rowNumber > 1) {

          row.eachCell(
            (cell) => {

              cell.border = {
                top: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
                left: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
                bottom: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
                right: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
              };

              cell.alignment = {
                vertical: "middle",
                wrapText: true,
              };

            }
          );

        }

      }
    );


    // ==================================================
    // COLUMN WIDTH
    // ==================================================

    const widths = [
      25,
      22,
      25,
      16,
      20,
      20,
      18,
      18,
      16,

      12, // Pangus
      12, // Tilapia
      12, // Koi
      12, // Shing
      12, // Pabda
      12, // Gulsha
      12, // Magur
      12, // Carp
      12, // Golda
      12, // Bagda
      12, // Tengra

      15, // Total Fish

      18,
      14,
      14,
      12,
      30,
    ];

    widths.forEach(
      (width, index) => {

        worksheet.getColumn(
          index + 1
        ).width = width;

      }
    );


    worksheet.getRow(1).height = 28;


    // ==================================================
    // FREEZE HEADER
    // ==================================================

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];


    // ==================================================
    // PRINT SETTINGS
    // ==================================================

    worksheet.pageSetup.orientation =
      "landscape";

    worksheet.pageSetup.fitToPage = true;

    worksheet.pageSetup.fitToWidth = 1;

    worksheet.pageSetup.fitToHeight = 0;


    // ==================================================
    // EXPORT
    // ==================================================

    const buffer =
      await workbook.xlsx.writeBuffer();

    const blob =
      new Blob(
        [buffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

    saveAs(
      blob,
      `Fish_Farmers_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );

  } catch (error) {

    console.error(
      "Fish Export Error:",
      error
    );

    alert(
      "Fish export failed. Please check the browser console."
    );

  }
}









  const selectedDistrict =
  districts.find(
    (d) =>
      d.name ===
      form.district
  );

  useEffect(() => {
  async function loadUpazilas() {

    if (
      !selectedDistrict
    ) {
      setUpazilas([]);
      return;
    }

    const { data } =
      await supabase
        .from("upazilas")
        .select("*")
        .eq(
          "district_id",
          selectedDistrict.id
        )
        .order("name");

    setUpazilas(
      data || []
    );
  }

  loadUpazilas();

}, [selectedDistrict]);

const selectedUpazila =
  upazilas.find(
    (u) =>
      u.name ===
      form.upazila
  );

  useEffect(() => {

  async function loadUnions() {

    if (
      !selectedUpazila
    ) {
      setUnions([]);
      return;
    }

    const { data } =
      await supabase
        .from("unions")
        .select("*")
        .eq(
          "upazila_id",
          selectedUpazila.id
        )
        .order("name");

    setUnions(
      data || []
    );
  }

  loadUnions();

}, [selectedUpazila]);




const companySummary =
  Object.values(
    farmers
      .filter((f) => {

        const matchSearch =
          f.farmer_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchCompany =
          companyFilter === "" ||
          String(
            f.company_id
          ) === companyFilter;

        const matchAgent =
          agentFilter === "" ||
          String(
            f.agent_id
          ) === agentFilter;

        const matchDistrict =
          districtFilter === "" ||
          f.district === districtFilter;

        const matchUpazila =
          upazilaFilter === "" ||
          f.upazila === upazilaFilter;

        const matchUnion =
          unionFilter === "" ||
          f.union_name === unionFilter;

        const matchFarmCategory =
          farmCategoryFilter === "" ||
          f.farm_category === farmCategoryFilter;

        return (
          matchSearch &&
          matchCompany &&
          matchAgent &&
          matchDistrict &&
          matchUpazila &&
          matchUnion && 
          matchFarmCategory
        );

      })
      .reduce(
      (acc: any, farmer: any) => {

        const company =
          farmer.companies
            ?.company_name ||
          "Unknown";

        if (!acc[company]) {

          acc[company] = {

            company,

            totalFarmers: 0,

            poultryFarmers: 0,
            cattleFarmers: 0,
            fishFarmers: 0,

            // Poultry
            broiler: 0,
            layer: 0,
            sonali: 0,
            duck: 0,
            quail: 0,
            deshiChicken: 0,

            // Cattle
            dairyCow: 0,
            bull: 0,
            calfHeifer: 0,

            // Fish
            pangus: 0,
            tilapia: 0,
            koi: 0,
            shing: 0,
            pabda: 0,
            gulsha: 0,
            magur: 0,
            carp: 0,
            golda: 0,
            bagda: 0,
            tengra: 0,

            totalPoultry: 0,
            totalCattle: 0,
            totalFish: 0,

            broilerFarmers: 0,
            layerFarmers: 0,
            sonaliFarmers: 0,
            duckFarmers: 0,
            quailFarmers: 0,
            deshiFarmers: 0,

            dairyCowFarmers: 0,
            bullFarmers: 0,
            calfHeiferFarmers: 0,

            pangusFarmers: 0,
            tilapiaFarmers: 0,
            koiFarmers: 0,
            shingFarmers: 0,
            pabdaFarmers: 0,
            gulshaFarmers: 0,
            magurFarmers: 0,
            carpFarmers: 0,
            goldaFarmers: 0,
            bagdaFarmers: 0,
            tengraFarmers: 0,



          };
        }

        acc[company].totalFarmers++;

          // Poultry
          if (Number(farmer.broiler || 0) > 0)
          acc[company].broilerFarmers++;

        if (Number(farmer.layer || 0) > 0)
          acc[company].layerFarmers++;

        if (Number(farmer.sonali || 0) > 0)
          acc[company].sonaliFarmers++;

        if (Number(farmer.duck || 0) > 0)
          acc[company].duckFarmers++;

        if (Number(farmer.quail || 0) > 0)
          acc[company].quailFarmers++;

        if (Number(farmer.deshi_chicken || 0) > 0)
          acc[company].deshiFarmers++;
          if (farmer.farm_category === "Poultry") {

            acc[company].poultryFarmers++;

            acc[company].broiler += Number(farmer.broiler || 0);
            acc[company].layer += Number(farmer.layer || 0);
            acc[company].sonali += Number(farmer.sonali || 0);
            acc[company].duck += Number(farmer.duck || 0);
            acc[company].quail += Number(farmer.quail || 0);
            acc[company].deshiChicken += Number(farmer.deshi_chicken || 0);

            acc[company].totalPoultry =
              acc[company].broiler +
              acc[company].layer +
              acc[company].sonali +
              acc[company].duck +
              acc[company].quail +
              acc[company].deshiChicken;
          }

          // Cattle
          if (Number(farmer.dairy_cow || 0) > 0)
            acc[company].dairyCowFarmers++;

          if (Number(farmer.bull || 0) > 0)
            acc[company].bullFarmers++;

          if (Number(farmer.calf_heifer || 0) > 0)
            acc[company].calfHeiferFarmers++;

          if (farmer.farm_category === "Cattle") {

            acc[company].cattleFarmers++;

            acc[company].dairyCow += Number(farmer.dairy_cow || 0);
            acc[company].bull += Number(farmer.bull || 0);
            acc[company].calfHeifer += Number(farmer.calf_heifer || 0);

            acc[company].totalCattle =
              acc[company].dairyCow +
              acc[company].bull +
              acc[company].calfHeifer;
          }


          // Fish

             if (farmer.farm_category === "Fish") {

          acc[company].fishFarmers++;

          acc[company].pangus += Number(farmer.pangus || 0);
          acc[company].tilapia += Number(farmer.tilapia || 0);
          acc[company].koi += Number(farmer.koi || 0);
          acc[company].shing += Number(farmer.shing || 0);
          acc[company].pabda += Number(farmer.pabda || 0);
          acc[company].gulsha += Number(farmer.gulsha || 0);
          acc[company].magur += Number(farmer.magur || 0);
          acc[company].carp += Number(farmer.carp || 0);
          acc[company].golda += Number(farmer.golda || 0);
          acc[company].bagda += Number(farmer.bagda || 0);
          acc[company].tengra += Number(farmer.tengra || 0);

          if (Number(farmer.pangus || 0) > 0)
            acc[company].pangusFarmers++;

          if (Number(farmer.tilapia || 0) > 0)
            acc[company].tilapiaFarmers++;

          if (Number(farmer.koi || 0) > 0)
            acc[company].koiFarmers++;

          if (Number(farmer.shing || 0) > 0)
            acc[company].shingFarmers++;

          if (Number(farmer.pabda || 0) > 0)
            acc[company].pabdaFarmers++;

          if (Number(farmer.gulsha || 0) > 0)
            acc[company].gulshaFarmers++;

          if (Number(farmer.magur || 0) > 0)
            acc[company].magurFarmers++;

          if (Number(farmer.carp || 0) > 0)
            acc[company].carpFarmers++;

          if (Number(farmer.golda || 0) > 0)
            acc[company].goldaFarmers++;

          if (Number(farmer.bagda || 0) > 0)
            acc[company].bagdaFarmers++;

          if (Number(farmer.tengra || 0) > 0)
            acc[company].tengraFarmers++;

          acc[company].totalFish =
            acc[company].pangus +
            acc[company].tilapia +
            acc[company].koi +
            acc[company].shing +
            acc[company].pabda +
            acc[company].gulsha +
            acc[company].magur +
            acc[company].carp +
            acc[company].golda +
            acc[company].bagda +
            acc[company].tengra;
        }

        return acc;

      },
      {}
    )
  );

  const selectedCompanyName =
  companies.find(
    (c) =>
      String(c.id) ===
      companyFilter
  )?.company_name ||
  "All Companies";



  // ==================================================
  // EXPORT FARMER SUMMARY EXCEL
  // ==================================================


function exportFarmerSummaryExcel() {
  try {

    // ==================================================
    // EXPORT DATA
    // ==================================================

    const exportData = companySummary.map(
      (row: any) => ({

        Company:
          row.company,

        Total_Farmers:
          row.totalFarmers,

        Poultry_Farmers:
          row.poultryFarmers,

        Cattle_Farmers:
          row.cattleFarmers,

        Fish_Farmers:
          row.fishFarmers,

      })
    );


    // ==================================================
    // CREATE WORKSHEET
    // ==================================================

    const worksheet =
      XLSX.utils.json_to_sheet(
        exportData
      );


    // ==================================================
    // COLUMN WIDTH
    // ==================================================

    worksheet["!cols"] = [
      { wch: 28 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
    ];


    // ==================================================
    // CREATE WORKBOOK
    // ==================================================

    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Company Summary"
    );


    // ==================================================
    // EXPORT
    // ==================================================

    const excelBuffer =
      XLSX.write(
        workbook,
        {
          bookType: "xlsx",
          type: "array",
        }
      );


    const file =
      new Blob(
        [excelBuffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );


    // ==================================================
    // FILE NAME
    // ==================================================

    const today =
      new Date()
        .toISOString()
        .split("T")[0];


    const fileName =
      `Company_Farmer_Summary_${
        districtFilter ||
        "AllDistricts"
      }_${
        upazilaFilter ||
        "AllUpazilas"
      }_${
        unionFilter ||
        "AllUnions"
      }_${
        farmCategoryFilter ||
        "AllTypes"
      }_${
        today
      }.xlsx`;


    // ==================================================
    // DOWNLOAD
    // ==================================================

    saveAs(
      file,
      fileName
    );

  } catch (error) {

    console.error(
      "Company Summary Export Error:",
      error
    );

    alert(
      "Company Summary export failed."
    );

  }
}




// ==================================================
// POULTRY SUMMARY EXPORT
// ==================================================

const exportPoultrySummaryExcel = async () => {
  try {
    const workbook = new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet("Poultry Summary");

    worksheet.addRow([
      "Company",
      "Broiler Farms",
      "Total Broiler",
      "Layer Farms",
      "Total Layer",
      "Sonali Farms",
      "Total Sonali",
      "Duck Farms",
      "Total Duck",
      "Quail Farms",
      "Total Quail",
      "Deshi Chicken Farms",
      "Total Deshi Chicken",
      "Total Poultry Farms",
      "Total Poultry",
    ]);

    companySummary.forEach((row: any) => {

      const poultryFarmers =
        farmers.filter((farmer: any) => {

          if (
            farmer.companies?.company_name !==
            row.company
          ) {
            return false;
          }

          const matchFarmCategory =
            farmer.farm_category === "Poultry";

          const matchSearch =
            farmer.farmer_name
              ?.toLowerCase()
              .includes(search.toLowerCase());

          const matchCompany =
            companyFilter === "" ||
            String(farmer.company_id) ===
              companyFilter;

          const matchAgent =
            agentFilter === "" ||
            String(farmer.agent_id) ===
              agentFilter;

          const matchDistrict =
            districtFilter === "" ||
            farmer.district ===
              districtFilter;

          const matchUpazila =
            upazilaFilter === "" ||
            farmer.upazila ===
              upazilaFilter;

          const matchUnion =
            unionFilter === "" ||
            farmer.union_name ===
              unionFilter;

          return (
            matchFarmCategory &&
            matchSearch &&
            matchCompany &&
            matchAgent &&
            matchDistrict &&
            matchUpazila &&
            matchUnion
          );
        });

      const countFarmers = (
        field: string
      ) =>
        poultryFarmers.filter(
          (f: any) =>
            Number(f[field] || 0) > 0
        ).length;

      const total = (
        field: string
      ) =>
        poultryFarmers.reduce(
          (
            sum: number,
            f: any
          ) =>
            sum +
            Number(f[field] || 0),
          0
        );

      worksheet.addRow([
        row.company,

        countFarmers("broiler"),
        total("broiler"),

        countFarmers("layer"),
        total("layer"),

        countFarmers("sonali"),
        total("sonali"),

        countFarmers("duck"),
        total("duck"),

        countFarmers("quail"),
        total("quail"),

        countFarmers("deshi_chicken"),
        total("deshi_chicken"),

        poultryFarmers.length,

        total("broiler") +
          total("layer") +
          total("sonali") +
          total("duck") +
          total("quail") +
          total("deshi_chicken"),
      ]);
    });

    // Header style
    const header = worksheet.getRow(1);

    header.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "D97706",
        },
      };

      cell.font = {
        bold: true,
        color: {
          argb: "FFFFFFFF",
        },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      cell.border = {
        top: {
          style: "thin",
          color: { argb: "FFFFFF" },
        },
        bottom: {
          style: "thin",
          color: { argb: "FFFFFF" },
        },
        left: {
          style: "thin",
          color: { argb: "FFFFFF" },
        },
        right: {
          style: "thin",
          color: { argb: "FFFFFF" },
        },
      };
    });

    // Data borders
    worksheet.eachRow(
      (row, rowNumber) => {

        if (rowNumber > 1) {

          row.eachCell((cell) => {

            cell.border = {
              top: {
                style: "thin",
                color: {
                  argb: "D1D5DB",
                },
              },
              bottom: {
                style: "thin",
                color: {
                  argb: "D1D5DB",
                },
              },
              left: {
                style: "thin",
                color: {
                  argb: "D1D5DB",
                },
              },
              right: {
                style: "thin",
                color: {
                  argb: "D1D5DB",
                },
              },
            };

            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
              wrapText: true,
            };
          });
        }
      }
    );

    worksheet.columns.forEach(
      (column) => {
        column.width = 18;
      }
    );

    worksheet.getColumn(1).width = 25;

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    worksheet.pageSetup.orientation =
      "landscape";

    worksheet.pageSetup.fitToPage = true;
    worksheet.pageSetup.fitToWidth = 1;
    worksheet.pageSetup.fitToHeight = 0;

    const buffer =
      await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Poultry_Summary_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );

  } catch (error) {

    console.error(
      "Poultry Export Error:",
      error
    );

    alert(
      "Poultry summary export failed."
    );
  }
};


// ==================================================
// CATTLE SUMMARY EXPORT
// ==================================================
const exportCattleSummaryExcel = async () => {
  try {
    const workbook = new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet("Cattle Summary");

    // ==================================================
    // TITLE
    // ==================================================

    worksheet.mergeCells("A1:L1");

    worksheet.getCell("A1").value =
      `Cattle Summary - ${selectedCompanyName}`;

    worksheet.getCell("A1").font = {
      bold: true,
      size: 16,
    };

    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.getRow(1).height = 28;

    // ==================================================
    // FILTER INFO
    // ==================================================

    worksheet.mergeCells("A2:L2");

    worksheet.getCell("A2").value =
      `District: ${districtFilter || "All"} | ` +
      `Upazila: ${upazilaFilter || "All"} | ` +
      `Union: ${unionFilter || "All"}`;

    worksheet.getCell("A2").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.getCell("A2").font = {
      italic: true,
      size: 10,
    };

    // ==================================================
    // HEADER
    // ==================================================

    worksheet.getRow(4).values = [
      "Company",

      "Dairy Cow",
      "Bull",
      "Calf / Heifer",

      "Total Cattle",
    ];

    // ==================================================
    // DATA
    // ==================================================

    companySummary.forEach((row: any) => {

      worksheet.addRow([
        row.company,

        Number(row.dairy_cow || 0),
        Number(row.bull || 0),
        Number(row.calf_heifer || 0),

        Number(row.totalCattle || 0),
      ]);

    });

    // ==================================================
    // HEADER STYLE
    // ==================================================

    for (let col = 1; col <= 5; col++) {

      const cell =
        worksheet.getCell(4, col);

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "15803D",
        },
      };

      cell.font = {
        bold: true,
        color: {
          argb: "FFFFFFFF",
        },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      cell.border = {
        top: {
          style: "thin",
          color: {
            argb: "FFFFFF",
          },
        },
        left: {
          style: "thin",
          color: {
            argb: "FFFFFF",
          },
        },
        bottom: {
          style: "thin",
          color: {
            argb: "FFFFFF",
          },
        },
        right: {
          style: "thin",
          color: {
            argb: "FFFFFF",
          },
        },
      };

    }

    // ==================================================
    // TOTAL CATTLE HEADER
    // ==================================================

    worksheet.getCell("E4").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "166534",
      },
    };

    // ==================================================
    // DATA STYLE
    // ==================================================

    worksheet.eachRow(
      (row, rowNumber) => {

        if (rowNumber >= 5) {

          row.eachCell(
            (cell) => {

              cell.border = {
                top: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },

                left: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },

                bottom: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },

                right: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
              };

              cell.alignment = {
                vertical: "middle",
                wrapText: true,
              };

            }
          );

        }

      }
    );

    // ==================================================
    // CENTER NUMBER COLUMNS
    // ==================================================

    for (
      let col = 2;
      col <= 5;
      col++
    ) {

      worksheet
        .getColumn(col)
        .alignment = {
          horizontal: "center",
          vertical: "middle",
        };

    }

    // ==================================================
    // TOTAL CATTLE COLUMN
    // ==================================================

    worksheet
      .getColumn(5)
      .eachCell((cell, rowNumber) => {

        if (rowNumber >= 5) {

          cell.font = {
            bold: true,
          };

        }

      });

    // ==================================================
    // COLUMN WIDTH
    // ==================================================

    worksheet.getColumn(1).width = 28;

    worksheet.getColumn(2).width = 15;

    worksheet.getColumn(3).width = 15;

    worksheet.getColumn(4).width = 18;

    worksheet.getColumn(5).width = 18;

    // ==================================================
    // ROW HEIGHT
    // ==================================================

    worksheet.getRow(4).height = 28;

    // ==================================================
    // FREEZE HEADER
    // ==================================================

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 4,
      },
    ];

    // ==================================================
    // PRINT SETTINGS
    // ==================================================

    worksheet.pageSetup.orientation =
      "landscape";

    worksheet.pageSetup.fitToPage = true;

    worksheet.pageSetup.fitToWidth = 1;

    worksheet.pageSetup.fitToHeight = 0;

    // ==================================================
    // EXPORT
    // ==================================================

    const buffer =
      await workbook.xlsx.writeBuffer();

    const blob = new Blob(
      [buffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    saveAs(
      blob,
      `Cattle_Summary_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );

  } catch (error) {

    console.error(
      "Cattle Summary Export Error:",
      error
    );

    alert(
      "Cattle Summary export failed. Please check the browser console."
    );

  }
};




// ==================================================
// FISH SUMMARY EXPORT
// ==================================================

const exportFishSummaryExcel = async () => {
  try {

    const workbook =
      new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet(
        "Fish Summary"
      );

    worksheet.addRow([
      "Company",

      "Pangus Farms",
      "Total Pangus",

      "Tilapia Farms",
      "Total Tilapia",

      "Koi Farms",
      "Total Koi",

      "Shing Farms",
      "Total Shing",

      "Pabda Farms",
      "Total Pabda",

      "Gulsha Farms",
      "Total Gulsha",

      "Magur Farms",
      "Total Magur",

      "Carp Farms",
      "Total Carp",

      "Golda Farms",
      "Total Golda",

      "Bagda Farms",
      "Total Bagda",

      "Tengra Farms",
      "Total Tengra",

      "Total Fish Farms",
      "Total Fish",
    ]);

    companySummary.forEach(
      (row: any) => {

        const fishFarmers =
          farmers.filter(
            (farmer: any) => {

              if (
                farmer.companies
                  ?.company_name !==
                row.company
              ) {
                return false;
              }

              return (
                farmer.farm_category ===
                  "Fish" &&

                (
                  companyFilter === "" ||
                  String(
                    farmer.company_id
                  ) === companyFilter
                ) &&

                (
                  agentFilter === "" ||
                  String(
                    farmer.agent_id
                  ) === agentFilter
                ) &&

                (
                  districtFilter === "" ||
                  farmer.district ===
                    districtFilter
                ) &&

                (
                  upazilaFilter === "" ||
                  farmer.upazila ===
                    upazilaFilter
                ) &&

                (
                  unionFilter === "" ||
                  farmer.union_name ===
                    unionFilter
                )
              );
            }
          );

        const countFarmers =
          (field: string) =>
            fishFarmers.filter(
              (f: any) =>
                Number(
                  f[field] || 0
                ) > 0
            ).length;

        const total =
          (field: string) =>
            fishFarmers.reduce(
              (
                sum: number,
                f: any
              ) =>
                sum +
                Number(
                  f[field] || 0
                ),
              0
            );

        const pangus =
          total("pangus");

        const tilapia =
          total("tilapia");

        const koi =
          total("koi");

        const shing =
          total("shing");

        const pabda =
          total("pabda");

        const gulsha =
          total("gulsha");

        const magur =
          total("magur");

        const carp =
          total("carp");

        const golda =
          total("golda");

        const bagda =
          total("bagda");

        const tengra =
          total("tengra");

        worksheet.addRow([

          row.company,

          countFarmers("pangus"),
          pangus,

          countFarmers("tilapia"),
          tilapia,

          countFarmers("koi"),
          koi,

          countFarmers("shing"),
          shing,

          countFarmers("pabda"),
          pabda,

          countFarmers("gulsha"),
          gulsha,

          countFarmers("magur"),
          magur,

          countFarmers("carp"),
          carp,

          countFarmers("golda"),
          golda,

          countFarmers("bagda"),
          bagda,

          countFarmers("tengra"),
          tengra,

          fishFarmers.length,

          pangus +
            tilapia +
            koi +
            shing +
            pabda +
            gulsha +
            magur +
            carp +
            golda +
            bagda +
            tengra,
        ]);
      }
    );

    // Header
    worksheet.getRow(1)
      .eachCell((cell) => {

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "0284C7",
          },
        };

        cell.font = {
          bold: true,
          color: {
            argb: "FFFFFFFF",
          },
        };

        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };

        cell.border = {
          top: {
            style: "thin",
            color: { argb: "FFFFFF" },
          },
          bottom: {
            style: "thin",
            color: { argb: "FFFFFF" },
          },
          left: {
            style: "thin",
            color: { argb: "FFFFFF" },
          },
          right: {
            style: "thin",
            color: { argb: "FFFFFF" },
          },
        };
      });

    // Data borders
    worksheet.eachRow(
      (row, rowNumber) => {

        if (rowNumber > 1) {

          row.eachCell((cell) => {

            cell.border = {
              top: {
                style: "thin",
                color: {
                  argb: "D1D5DB",
                },
              },
              bottom: {
                style: "thin",
                color: {
                  argb: "D1D5DB",
                },
              },
              left: {
                style: "thin",
                color: {
                  argb: "D1D5DB",
                },
              },
              right: {
                style: "thin",
                color: {
                  argb: "D1D5DB",
                },
              },
            };

            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
              wrapText: true,
            };
          });
        }
      }
    );

    worksheet.columns.forEach(
      (column) => {
        column.width = 18;
      }
    );

    worksheet.getColumn(1).width = 25;

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    worksheet.pageSetup.orientation =
      "landscape";

    worksheet.pageSetup.fitToPage = true;
    worksheet.pageSetup.fitToWidth = 1;
    worksheet.pageSetup.fitToHeight = 0;

    const buffer =
      await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Fish_Summary_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );

  } catch (error) {

    console.error(
      "Fish Export Error:",
      error
    );

    alert(
      "Fish summary export failed."
    );
  }
};




  

const filteredFarmers =
  farmers.filter((f) => {

    const matchSearch =
      f.farmer_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const matchCompany =
      companyFilter === "" ||
      String(f.company_id) === companyFilter;

    const matchAgent =
      agentFilter === "" ||
      String(f.agent_id) === agentFilter;

    const matchDistrict =
      districtFilter === "" ||
      f.district === districtFilter;

    const matchUpazila =
      upazilaFilter === "" ||
      f.upazila === upazilaFilter;

    const matchUnion =
      unionFilter === "" ||
      f.union_name === unionFilter;

    const matchFarmType =
      farmCategoryFilter === "" ||
      f.farm_type === farmCategoryFilter;

    return (
      matchSearch &&
      matchCompany &&
      matchAgent &&
      matchDistrict &&
      matchUpazila &&
      matchUnion &&
      matchFarmType
    );
  });





  const nearestFarmers =
  myPosition
    ? filteredFarmers
        .filter(
          (f) =>
            f.latitude &&
            f.longitude &&
            !isNaN(Number(f.latitude)) &&
            !isNaN(Number(f.longitude))
        )
        .map((f) => ({

          ...f,

          distance:

            Math.round(

              Math.sqrt(

                Math.pow(
                  Number(f.latitude) -
                    myPosition[0],
                  2
                ) +

                Math.pow(
                  Number(f.longitude) -
                    myPosition[1],
                  2
                )

              ) * 111

            ),

        }))
        .sort(
          (a, b) =>
            a.distance -
            b.distance
        )
        .slice(0, 10)
    : [];


    
    
    useEffect(() => {

  async function loadFilterUpazilas() {
    

    // District select না করলে সব Upazila দেখাবে
    if (!districtFilter) {

      const { data } = await supabase
        .from("upazilas")
        .select("*")
        .order("name");

      setFilterUpazilas(data || []);

      return;
    }

    // Selected District
    const district = districts.find(
      (d) => d.name === districtFilter
    );

    if (!district) {

      setFilterUpazilas([]);

      return;
    }

    const { data } = await supabase
      .from("upazilas")
      .select("*")
      .eq("district_id", district.id)
      .order("name");

    setFilterUpazilas(data || []);

  }

  loadFilterUpazilas();

}, [districtFilter, districts]);




useEffect(() => {

  async function loadFilterUnions() {

    // কোনো Upazila select না করলে
    if (!upazilaFilter) {

      // District-ও select না করলে সব Union
      if (!districtFilter) {

        const { data } = await supabase
          .from("unions")
          .select("*")
          .order("name");

        setFilterUnions(data || []);

        return;
      }

      // District selected কিন্তু Upazila selected না
      const district = districts.find(
        (d) => d.name === districtFilter
      );

      if (!district) {

        setFilterUnions([]);

        return;
      }

      // ঐ District-এর সব Upazila
      const { data: upazilas } = await supabase
        .from("upazilas")
        .select("id")
        .eq("district_id", district.id);

      const upazilaIds = (upazilas || []).map(
        (u: any) => u.id
      );

      if (upazilaIds.length === 0) {

        setFilterUnions([]);

        return;
      }

      // ঐ District-এর সব Union
      const { data } = await supabase
        .from("unions")
        .select("*")
        .in("upazila_id", upazilaIds)
        .order("name");

      setFilterUnions(data || []);

      return;
    }

    // Upazila selected
    const upazila = filterUpazilas.find(
      (u) => u.name === upazilaFilter
    );

    if (!upazila) {

      setFilterUnions([]);

      return;
    }

    // শুধু selected Upazila-এর Union
    const { data } = await supabase
      .from("unions")
      .select("*")
      .eq("upazila_id", upazila.id)
      .order("name");

    setFilterUnions(data || []);

  }

  loadFilterUnions();

}, [
  upazilaFilter,
  districtFilter,
  districts,
  filterUpazilas
]);




  return (
    <div className="p-4">

      <div className="mb-4">
      <button
  onClick={() => {
  setEditingId(null);

  setForm({
  company_id: "",
  agent_id: "",

  farmer_name: "",
  mobile: "",

  village: "",
  union_name: "",
  upazila: "",
  district: "Mymensingh",

  farm_category: "",

  // Poultry
  broiler: "",
  layer: "",
  sonali: "",
  duck: "",
  quail: "",
  deshi_chicken: "",

  // Cattle
  dairy_cow: "",
  bull: "",
  calf_heifer: "",

  // Fish
  pangus: "",
  tilapia: "",
  koi: "",
  shing: "",
  pabda: "",
  gulsha: "",
  magur: "",
  carp: "",
  golda: "",
  bagda: "",
  tengra: "",

  feed_type: "",

  latitude: "",
  longitude: "",

  status: "Active",

  remarks: "",
});

  setShowForm(true);
}}
  className="bg-green-600 text-white px-4 py-2 rounded"
>
  Add Farmer
</button>
    </div>

    {showForm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-xl font-bold">
          {editingId
            ? "Edit Farmer"
            : "Add Farmer"}
        </h2>

        <button
          onClick={() =>
            setShowForm(false)
          }
        >
          ✖
        </button>

      </div>



          <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Company </label>
        <select
          value={form.company_id}
          onChange={(e) => {
  const companyId =
    e.target.value;

  setForm({
    ...form,
    company_id:
      companyId,
    agent_id: "",
  });

  const filtered =
    agents.filter(
      (agent) =>
        String(
          agent.company_id
        ) === companyId
    );

  setFilteredAgents(
    filtered
  );
}}

      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        >
          
          <option value="">
            Select Company
          </option>

          {companies.map(
            (company) => (
              <option
                key={company.id}
                value={company.id}
              >
                {
                  company.company_name
                }
              </option>
            )
          )}
        </select>

    <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Agent </label>
        <select
          value={form.agent_id}
          onChange={(e) =>
            setForm({
              ...form,
              agent_id:
                e.target.value,
            })
          }
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"        >
          <option value="">
            Select Agent
          </option>

          {filteredAgents.map(
            (agent) => (
              <option
                key={agent.id}
                value={agent.id}
              >
                {
                  agent.agent_name
                }
              </option>
            )
          )}
        </select>

    <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Farmer </label>
        <input
          placeholder="Farmer Name"
          value={
            form.farmer_name
          }
          onChange={(e) =>
            setForm({
              ...form,
              farmer_name:
                e.target.value,
            })
          }
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"        />
        
        
        <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Mobile </label>
        <input
          placeholder="Mobile"
          value={form.mobile}
          onChange={(e) =>
            setForm({
              ...form,
              mobile:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        />



          <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            District </label>
        <select
  value={form.district}
  onChange={(e) =>
    setForm({
      ...form,
      district:
        e.target.value,
      upazila: "",
      union_name: "",
    })
  }
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
>
  <option value="">
    Select District
  </option>

  {districts.map(
    (district) => (
      <option
        key={district.id}
        value={district.name}
      >
        {district.name}
      </option>
    )
  )}
</select>

<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Upazila </label>
<select
  value={form.upazila}
  onChange={(e) =>
    setForm({
      ...form,
      upazila:
        e.target.value,
      union_name: "",
    })
  }
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
>
  <option value="">
    Select Upazila
  </option>

  {upazilas.map(
    (upazila) => (
      <option
        key={upazila.id}
        value={upazila.name}
      >
        {upazila.name}
      </option>
    )
  )}
</select>

<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Union </label>
<select
  value={
    form.union_name
  }
  onChange={(e) =>
    setForm({
      ...form,
      union_name:
        e.target.value,
    })
  }
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
>
  <option value="">
    Select Union
  </option>

  {unions.map(
    (union) => (
      <option
        key={union.id}
        value={union.name}
      >
        {union.name}
      </option>
    )
  )}
</select>

<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Village </label>
<input
          placeholder="Village"
          value={form.village}
          onChange={(e) =>
            setForm({
              ...form,
              village:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        />


          <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Location Select from Map </label>
          <button
  type="button"
  onClick={() =>
    setShowMap(true)
  }
  className="bg-blue-600 text-white px-4 py-2 rounded mb-3"
>
  Open Map
</button>

{form.latitude &&
  form.longitude && (
    <div className="mb-3 text-green-700 font-semibold">
      📍 Location Selected
    </div>
)}
<label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1">
  Farm Category
</label>

<select
  value={form.farm_category || ""}
  onChange={(e) =>
    setForm({
      ...form,
      farm_category: e.target.value,
    })
  }
  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-4"
>
  <option value="">Select Category</option>
  <option value="Poultry">🐔 Poultry</option>
  <option value="Cattle">🐄 Cattle</option>
  <option value="Fish">🐟 Fish</option>
</select>

{/* Poultry */}
{form.farm_category === "Poultry" && (
  <div className="grid grid-cols-2 gap-3 mb-4">
    {[
      "broiler",
      "layer",
      "sonali",
      "duck",
      "quail",
      "deshi_chicken",
    ].map((item) => (
      <div key={item}>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          {item.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
        </label>

        <input
          type="number"
          min="0"
          value={form[item as keyof typeof form] || ""}
          onChange={(e) =>
            setForm({
              ...form,
              [item]: e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
    ))}
  </div>
)}

{/* Cattle */}
{form.farm_category === "Cattle" && (
  <div className="grid grid-cols-2 gap-3 mb-4">
    {[
      "dairy_cow",
      "bull",
      "calf_heifer",
    ].map((item) => (
      <div key={item}>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          {item.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
        </label>

        <input
          type="number"
          min="0"
          value={form[item as keyof typeof form] || ""}
          onChange={(e) =>
            setForm({
              ...form,
              [item]: e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
    ))}
  </div>
)}

{/* Fish */}
{form.farm_category === "Fish" && (
  <div className="grid grid-cols-2 gap-3 mb-4">
    {[
      "pangus",
      "tilapia",
      "koi",
      "shing",
      "pabda",
      "gulsha",
      "magur",
      "carp",
      "golda",
      "bagda",
      "tengra",
    ].map((item) => (
      <div key={item}>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          {item.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
        </label>

        <input
          type="number"
          min="0"
          value={form[item as keyof typeof form] || ""}
          onChange={(e) =>
            setForm({
              ...form,
              [item]: e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
    ))}
  </div>
)}
          <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Feed Type </label>
        <input
          placeholder="Feed Type"
          value={
            form.feed_type
          }
          onChange={(e) =>
            setForm({
              ...form,
              feed_type:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        />

          <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-1"> 
            Remarks </label>
        <textarea
          placeholder="Remarks"
          value={form.remarks}
          onChange={(e) =>
            setForm({
              ...form,
              remarks:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
        />

        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {editingId
            ? "Update Farmer"
            : "Save Farmer"}
        </button>

        <button
  onClick={() =>
    setShowForm(false)
  }
  className="bg-gray-500 text-white px-4 py-2 rounded"
>
  Cancel
</button>

    </div>

  </div>
)}

      <input
        type="text"
        placeholder="Search Farmer..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition mb-4"
      />

<div className="bg-white border rounded-xl shadow-sm p-4 mb-5">
  <h3 className="mb-3 text-sm font-semibold text-slate-700">
    🔎 Filter Farmers
</h3>



  <div className="flex flex-wrap gap-3 items-center">
    
  <select
    value={districtFilter}
    onChange={(e) => {

  setDistrictFilter(e.target.value);

  setUpazilaFilter("");
  setUnionFilter("");

}}


className="min-w-[170px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" >
    <option value="">
      All Districts
    </option>

    {[...new Set(
      farmers.map(
        (f) => f.district
      )
    )].map((district) => (
      <option
        key={district}
        value={district}
      >
        {district}
      </option>
    ))}
  </select>




 <select
  value={upazilaFilter}
  onChange={(e) => {
    setUpazilaFilter(e.target.value);
    setUnionFilter("");
  }}
  className="min-w-[170px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
>
  <option value="">
    All Upazilas
  </option>

  {filterUpazilas.map((u: any) => (
    <option
      key={u.id}
      value={u.name}
    >
      {u.name}
    </option>
  ))}
</select>



 <select
  value={unionFilter}
  onChange={(e) => {
    setUnionFilter(e.target.value);
  }}
  className="min-w-[170px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
>
  <option value="">
    All Unions
  </option>

  {filterUnions.map((u: any) => (
    <option
      key={u.id}
      value={u.name}
    >
      {u.name}
    </option>
  ))}
</select>



<select
  value={farmCategoryFilter}
  onChange={(e) =>
    setFarmCategoryFilter(e.target.value)
  }
  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
>
  <option value="">All Categories</option>
  <option value="Poultry">Poultry</option>
  <option value="Cattle">Cattle</option>
  <option value="Fish">Fish</option>
</select>



<select
  value={companyFilter}
  onChange={(e) => {
    setCompanyFilter(e.target.value);
    setAgentFilter("");
  }}
  className="min-w-[170px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
>
  <option value="">
    All Companies
  </option>

  {companies.map((c) => (
    <option
      key={c.id}
      value={c.id}
    >
      {c.company_name}
    </option>
  ))}
</select>


<select
  value={agentFilter}
  onChange={(e) => setAgentFilter(e.target.value)}
  className="min-w-[170px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
>
  <option value="">
    All Agents
  </option>

  {agents
    .filter((a) =>
      companyFilter === "" ||
      String(a.company_id) === String(companyFilter)
    )
    .map((a) => (
      <option
        key={a.id}
        value={a.id}
      >
        {a.agent_name}
      </option>
    ))}
</select>


  <button
  onClick={clearFilters}
className="rounded-lg bg-slate-700 px-5 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 transition">
  Clear Filters
</button>
</div>
</div>

<div className="bg-white rounded-xl shadow border p-4 mb-5">

  <div className="flex flex-wrap items-center gap-3">
<div className="flex gap-2">

<button

onClick={() => {

  setShowFarmerMap(false);

  setShowSummary(true);

}}

className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
>
📊 Summary
</button>


<div className="relative inline-block">

  <button
    onClick={() => setShowExportMenu(!showExportMenu)}
    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
  >
    📄 Export Excel
    <span className="text-xs">
      {showExportMenu ? "▲" : "▼"}
    </span>
  </button>

  {showExportMenu && (

    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">

      <button
        onClick={() => {
          exportAllFarmersExcel();
          setShowExportMenu(false);
        }}
        className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b"
      >
        📄 Export All Farmers
      </button>

      <button
        onClick={() => {
          exportPoultryExcel();
          setShowExportMenu(false);
        }}
        className="w-full text-left px-4 py-3 hover:bg-amber-50 border-b"
      >
        🐔 Export Poultry Farmers
      </button>

      <button
        onClick={() => {
          exportCattleExcel();
          setShowExportMenu(false);
        }}
        className="w-full text-left px-4 py-3 hover:bg-green-50 border-b"
      >
        🐄 Export Cattle Farmers
      </button>

      <button
        onClick={() => {
          exportFishExcel();
          setShowExportMenu(false);
        }}
        className="w-full text-left px-4 py-3 hover:bg-sky-50"
      >
        🐟 Export Fish Farmers
      </button>

    </div>

  )}

</div>

</div>


<div className="flex gap-2">

<button
  onClick={() => {

  if (!showFarmerMap) {

    setMyLocationMode(false);
    setMyPosition(null);
    setSelectedFarmerPosition(null);

  }

  setShowSummary(false);

  setShowFarmerMap(!showFarmerMap);

}}

  className={`
    px-4
    py-2
    rounded-lg
    font-medium
    transition

    ${
      showFarmerMap
        ? "bg-slate-600 hover:bg-red-700 text-white"
        : "bg-blue-600 hover:bg-blue-700 text-white"
    }
  `}
>

  {showFarmerMap
    ? "❌ Close Map"
    : "🗺️ View Map"}

</button>

</div>
</div>
</div>


{showFarmerMap && (

<div className="bg-white rounded-xl shadow-lg p-4 mb-4">

  <h3 className="text-lg font-semibold mb-3">
    Farmer Map
  </h3>


<div className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
  <div className="relative">
  <MapContainer

    center={[
      24.7471,
      90.4203,
    ]}
    zoom={8}
    style={{
      height: "500px",
      width: "100%",
    }}
  >

    <MapLayers />

    {myLocationMode && myPosition ? (

  <RecenterMap
    position={myPosition}
  />

) : selectedFarmerPosition ? (

  <RecenterMap
    position={selectedFarmerPosition}
  />

) : null}

    {myPosition && (

  <Marker position={myPosition}>
    <Tooltip
  permanent
  direction="top"
  offset={[0, -15]}
  className="my-location-label"
>
  📍 My Location
</Tooltip>

    <Popup>

      <div
        style={{
          maxHeight: "250px",
          overflowY: "auto",
          width: "220px",
        }}
      >

        <h3 className="text-base font-bold text-slate-800 mb-2">
          📍 My Location
        </h3>

        <h4 className="text-base font-medium text-slate-700 mb-2">
          Nearest Farmers
        </h4>

        {nearestFarmers.length === 0 ? (

          <div>No nearby farmers found.</div>

        ) : (

          nearestFarmers.map(
            (farmer, index) => (

              <div
                key={farmer.id}
                style={{
                  marginBottom: "8px",
                }}
              >

                <button

                  onClick={() => {

                    setSelectedFarmerPosition([
                      Number(farmer.latitude),
                      Number(farmer.longitude),
                    ]);
                    setMyLocationMode(false);

                  }}

                  style={{
                    border: "none",
                    background: "none",
                    color: "#2563eb",
                    cursor: "pointer",
                    fontWeight: "bold",
                    padding: 0,
                  }}
                >

                  {index + 1}. {farmer.farmer_name}

                </button>

                <br />

                {farmer.distance} km

              </div>

            )
          )

        )}

      </div>

    </Popup>

  </Marker>

)}


{!selectedFarmerPosition && (
  <FitBounds
    positions={
      myLocationMode
        ? []
        : filteredFarmers
            .filter(
              (f) =>
                f.latitude &&
                f.longitude
            )
            .map((f) => [
              Number(f.latitude),
              Number(f.longitude),
            ])
    }
  />
)}




    {filteredFarmers
      .filter(
        (f) =>
          f.latitude &&
          f.longitude
      )
      .map(
        (farmer) => (

         <Marker

  key={farmer.id}

  ref={(ref) => {

    farmerMarkerRefs.current[
      farmer.id
    ] = ref;

  }}

  position={[
    Number(farmer.latitude),
    Number(farmer.longitude),
  ]}

  icon={createFarmMarker(
    farmer.companies?.logo_url,
    farmer.farm_type,
    farmer.farmer_name
  )}

>

            <Popup maxWidth={350}>

            <div
              style={{
                minWidth: "250px",
                lineHeight: "1.7",
              }}
            >

              <img
                  src={
                    farmer.companies
                      ?.logo_url
                  }
                  style={{
                    width: "70px",
                    maxHeight: "58px",
                    objectFit: "contain",
                    marginBottom: "8px",
                  }}
                />

              <h3
                style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  marginBottom: "8px",
                }}
              >
                {getFarmIcon(
                  farmer.farm_type
                )}{" "}
                {farmer.farmer_name}
              </h3>

              <hr />

              <div>
                <b>Company:</b>{" "}
                {farmer.companies
                  ?.company_name}
              </div>

              <div>
                <b>Agent:</b>{" "}
                {farmer.agents
                  ?.agent_name}
              </div>

              <div>
                <b>Mobile:</b>{" "}
                {farmer.mobile}
              </div>

              <div>
                <b>Farm Type:</b>{" "}
                {farmer.farm_type}
              </div>

              <div>
                <b>Farm Size:</b>{" "}
                {farmer.farm_size}
              </div>

              <div>
                <b>Village:</b>{" "}
                {farmer.village}
              </div>

              <div>
                <b>Union:</b>{" "}
                {farmer.union_name}
              </div>

              <div>
                <b>Upazila:</b>{" "}
                {farmer.upazila}
              </div>

              <div>
                <b>District:</b>{" "}
                {farmer.district}
              </div>

              <div>
                <b>Status:</b>{" "}
                {farmer.status}
              </div>

              <div>
                <b>Remarks:</b>{" "}
                {farmer.remarks || "-"}
              </div>

            </div>

          </Popup>

          </Marker>

        )
      )}

  </MapContainer>
    

{showFarmerMap && (

<button

onClick={() => {

navigator.geolocation.getCurrentPosition(

(position) => {

setSelectedFarmerPosition(null);

setMyPosition([

position.coords.latitude,

position.coords.longitude,

]);

setMyLocationMode(true);

}

);

}}

className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full shadow-xl px-4 py-2 font-semibold hover:from-blue-700 hover:to-sky-600 transition-all duration-300">
  <MapPin size={18} />
  <span>Locate Me</span>
</button>

)}
  </div>
  </div>

</div>

)}



<div className="overflow-x-auto">
      <table className="w-max border">

        <thead>

          <tr>
            <th className="border px-2 py-0.5 text-xs">
              Company
            </th>

            <th className="border px-2 py-0.5 text-xs">
              Agent
            </th>

            <th className="border px-2 py-0.5 text-xs">
              Farmer
            </th>

            <th className="border px-2 py-0.5 text-xs">
              Mobile
            </th>

            <th className="border px-2 py-0.5 text-xs">
              Village
            </th>

            <th className="border px-2 py-0.5 text-xs">
              Union
            </th>

            <th className="border px-2 py-0.5 text-xs">
              Upazila
            </th>

            <th className="border px-2 py-0.5 text-xs">
              Category
            </th>

            <th className="border px-2 py-0.5 text-xs">
              Farm Details
            </th>
            

            <th className="border px-2 py-0.5 text-xs">
              Status
            </th>

            <th className="border px-2 py-0.5 text-xs">
              Actions
            </th>
          </tr>

        </thead>

        <tbody>

          {farmers
  .filter((f) => {

    const matchSearch =
      f.farmer_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const matchCompany =
      companyFilter === ""
        ? true
        : String(
            f.company_id
          ) === companyFilter;

    const matchAgent =
      agentFilter === ""
        ? true
        : String(
            f.agent_id
          ) === agentFilter;

    const matchDistrict =
      districtFilter === ""
        ? true
        : f.district ===
          districtFilter;

    const matchUpazila =
      upazilaFilter === ""
        ? true
        : f.upazila ===
          upazilaFilter;

    const matchUnion =
      unionFilter === ""
        ? true
        : f.union_name ===
          unionFilter;

    const matchCategory =
      farmCategoryFilter === "" ||
      f.farm_category === farmCategoryFilter;

    return (
      matchSearch &&
      matchCompany &&
      matchAgent &&
      matchDistrict &&
      matchUpazila &&
      matchUnion &&
      matchCategory
    );
  })

  .sort((a: any, b: any) => {

  const companyCompare =
    (
      a.agents?.companies
        ?.company_name || ""
    ).localeCompare(
      b.agents?.companies
        ?.company_name || ""
    );

  if (companyCompare !== 0) {
    return companyCompare;
  }

  return (
    a.farmer_name || ""
  ).localeCompare(
    b.farmer_name || ""
  );

})

  .map((farmer) => (
              <tr
                key={farmer.id}
              >
                <td className="border px-2 py-0.5 text-xs">
                  {
                    farmer
                      .companies
                      ?.company_name
                  }
                </td>

                <td className="border px-2 py-0.5 text-xs">
                  {
                    farmer
                      .agents
                      ?.agent_name
                  }
                </td>

                <td className="border px-2 py-0.5 text-xs">
                  {
                    farmer.farmer_name
                  }
                </td>

                <td className="border px-2 py-0.5 text-xs">
                  {
                    farmer.mobile
                  }
                </td>


                <td className="border px-2 py-0.5 text-xs">
                  {
                    farmer.village
                  }
                </td>
                  
                  <td className="border px-2 py-0.5 text-xs">
                  {
                    farmer.union_name
                  }
                </td>

                <td className="border px-2 py-0.5 text-xs">
                  {
                    farmer.upazila
                  }
                </td>

                
                <td className="border px-2 py-0.5 text-xs">

                <span
                  className={`px-2 py-1 rounded-full text-white text-[11px]
                    ${
                      farmer.farm_category === "Poultry"
                        ? "bg-amber-500"
                        : farmer.farm_category === "Cattle"
                        ? "bg-green-600"
                        : "bg-sky-600"
                    }`}
                >
                  {farmer.farm_category}
                </span>

              </td>

                <td className="border px-2 py-1 text-xs">

                  {farmer.farm_category === "Poultry" && (

                    <div className="space-y-1">

                      {farmer.broiler > 0 && (
                        <div>Broiler : {farmer.broiler}</div>
                      )}

                      {farmer.layer > 0 && (
                        <div>Layer : {farmer.layer}</div>
                      )}

                      {farmer.sonali > 0 && (
                        <div>Sonali : {farmer.sonali}</div>
                      )}

                      {farmer.duck > 0 && (
                        <div>Duck : {farmer.duck}</div>
                      )}

                      {farmer.quail > 0 && (
                        <div>Quail : {farmer.quail}</div>
                      )}

                      {farmer.deshi_chicken > 0 && (
                        <div>Deshi : {farmer.deshi_chicken}</div>
                      )}

                    </div>

                  )}

                  {farmer.farm_category === "Cattle" && (

                    <div className="space-y-1">

                      {farmer.dairy_cow > 0 && (
                        <div>Dairy : {farmer.dairy_cow}</div>
                      )}

                      {farmer.bull > 0 && (
                        <div>Bull : {farmer.bull}</div>
                      )}

                      {farmer.calf_heifer > 0 && (
                        <div>Calf/Heifer : {farmer.calf_heifer}</div>
                      )}

                    </div>

                  )}

                  {farmer.farm_category === "Fish" && (

                    <div className="space-y-1">

                      {farmer.pangus > 0 && (
                        <div>Pangus : {farmer.pangus}</div>
                      )}

                      {farmer.tilapia > 0 && (
                        <div>Tilapia : {farmer.tilapia}</div>
                      )}

                      {farmer.koi > 0 && (
                        <div>Koi : {farmer.koi}</div>
                      )}

                      {farmer.shing > 0 && (
                        <div>Shing : {farmer.shing}</div>
                      )}

                      {farmer.pabda > 0 && (
                        <div>Pabda : {farmer.pabda}</div>
                      )}

                      {farmer.gulsha > 0 && (
                        <div>Gulsha : {farmer.gulsha}</div>
                      )}

                      {farmer.magur > 0 && (
                        <div>Magur : {farmer.magur}</div>
                      )}

                      {farmer.carp > 0 && (
                        <div>Carp : {farmer.carp}</div>
                      )}

                      {farmer.golda > 0 && (
                        <div>Golda : {farmer.golda}</div>
                      )}

                      {farmer.bagda > 0 && (
                        <div>Bagda : {farmer.bagda}</div>
                      )}

                      {farmer.tengra > 0 && (
                        <div>Tengra : {farmer.tengra}</div>
                      )}

                    </div>

                  )}

                </td>

                <td className="border px-2 py-0.5 text-xs">
                  {
                    farmer.status
                  }
                </td>

                <td className="border px-2 py-0.5 text-xs">

  <button
    onClick={() =>
      setSelectedFarmer(farmer)
    }
    className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
  >
    View
  </button>

  <button
    onClick={() => {
      setEditingId(farmer.id);
      const filtered =
  agents.filter(
    (agent) =>
      agent.company_id ===
      farmer.company_id
  );

setFilteredAgents(
  filtered
);

      setForm({
  company_id: String(farmer.company_id),
  agent_id: String(farmer.agent_id),

  farmer_name: farmer.farmer_name || "",
  mobile: farmer.mobile || "",

  village: farmer.village || "",
  union_name: farmer.union_name || "",
  upazila: farmer.upazila || "",
  district: farmer.district || "",

  // New
  farm_category: farmer.farm_category || "",

  // Poultry
  broiler: String(farmer.broiler || ""),
  layer: String(farmer.layer || ""),
  sonali: String(farmer.sonali || ""),
  duck: String(farmer.duck || ""),
  quail: String(farmer.quail || ""),
  deshi_chicken: String(farmer.deshi_chicken || ""),

  // Cattle
  dairy_cow: String(farmer.dairy_cow || ""),
  bull: String(farmer.bull || ""),
  calf_heifer: String(farmer.calf_heifer || ""),

  // Fish
  pangus: String(farmer.pangus || ""),
  tilapia: String(farmer.tilapia || ""),
  koi: String(farmer.koi || ""),
  shing: String(farmer.shing || ""),
  pabda: String(farmer.pabda || ""),
  gulsha: String(farmer.gulsha || ""),
  magur: String(farmer.magur || ""),
  carp: String(farmer.carp || ""),
  golda: String(farmer.golda || ""),
  bagda: String(farmer.bagda || ""),
  tengra: String(farmer.tengra || ""),

  feed_type: farmer.feed_type || "",

  latitude: String(farmer.latitude || ""),
  longitude: String(farmer.longitude || ""),

  status: farmer.status || "Active",
  remarks: farmer.remarks || "",
});

      setShowForm(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }}
    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
  >
    Edit
  </button>

  <button
    onClick={() =>
      handleDelete(
        farmer.id
      )
    }
    className="bg-red-600 text-white px-2 py-1 rounded"
  >
    Delete
  </button>

</td>
              </tr>
            ))}

        </tbody>

      </table>

      </div>


      {/* View Farmer PopUp */}

{selectedFarmer && (
  <div className="fixed inset-x-0 top-18 bottom-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded w-[700px] max-h-[90vh] overflow-auto">

      <div className="flex justify-between mb-4">

        <h2 className="text-xl font-bold">
          Farmer Details
        </h2>

        <button
          onClick={() =>
            setSelectedFarmer(
              null
            )
          }
        >
          ✖
        </button>

      </div>

      <div className="space-y-2">


        {/* Company Information */}

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            🏢 Company Information
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div className="flex items-center gap-3">

              <img
                src={
                  selectedFarmer?.companies?.logo_url ||
                  "/logo.png"
                }
                alt="Company Logo"
                className="w-12 h-12 rounded-lg object-contain border bg-white p-1"
              />

              <div>
                <div className="text-xs text-slate-500">
                  Company
                </div>

                <div className="font-semibold text-slate-800">
                  {selectedFarmer?.companies?.company_name}
                </div>
              </div>

            </div>

            <div>

              <div className="text-xs text-slate-500">
                Agent
              </div>

              <div className="font-semibold text-slate-800">
                {selectedFarmer?.agents?.agent_name}
              </div>

            </div>

          </div>

        </div>



          {/* Farmer Information */}

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">

          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            👨 Farmer Information
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <div className="text-xs text-slate-500">
                Farmer Name
              </div>

              <div className="font-semibold text-slate-800">
                {selectedFarmer?.farmer_name}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                Mobile
              </div>

              <div className="font-semibold text-slate-800">
                {selectedFarmer?.mobile || "-"}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                Village
              </div>

              <div className="font-semibold text-slate-800">
                {selectedFarmer?.village || "-"}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                Union
              </div>

              <div className="font-semibold text-slate-800">
                {selectedFarmer?.union_name || "-"}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                Upazila
              </div>

              <div className="font-semibold text-slate-800">
                {selectedFarmer?.upazila || "-"}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                District
              </div>

              <div className="font-semibold text-slate-800">
                {selectedFarmer?.district || "-"}
              </div>
            </div>

          </div>

        </div>


        {/* Farm Information */}

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">

  <h3 className="text-sm font-semibold text-slate-700 mb-4">

    {selectedFarmer?.farm_category === "Poultry" && "🐔 Poultry Information"}

    {selectedFarmer?.farm_category === "Cattle" && "🐄 Cattle Information"}

    {selectedFarmer?.farm_category === "Fish" && "🐟 Fish Information"}

  </h3>


  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

  <table className="w-full text-sm">

    <thead className="bg-slate-100">

      <tr>

        <th className="px-4 py-2 text-left font-semibold text-slate-700">
          Category
        </th>

        <th className="px-4 py-2 text-right font-semibold text-slate-700">
          Quantity
        </th>

      </tr>

    </thead>

    <tbody>

      {/* Poultry */}

      {selectedFarmer?.broiler > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐔 Broiler</td>
          <td className="px-4 py-2 text-right font-bold text-blue-600">
            {selectedFarmer.broiler}
          </td>
        </tr>
      )}

      {selectedFarmer?.layer > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🥚 Layer</td>
          <td className="px-4 py-2 text-right font-bold text-blue-600">
            {selectedFarmer.layer}
          </td>
        </tr>
      )}

      {selectedFarmer?.sonali > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐔 Sonali</td>
          <td className="px-4 py-2 text-right font-bold text-blue-600">
            {selectedFarmer.sonali}
          </td>
        </tr>
      )}

      {selectedFarmer?.duck > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🦆 Duck</td>
          <td className="px-4 py-2 text-right font-bold text-blue-600">
            {selectedFarmer.duck}
          </td>
        </tr>
      )}

      {selectedFarmer?.quail > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐦 Quail</td>
          <td className="px-4 py-2 text-right font-bold text-blue-600">
            {selectedFarmer.quail}
          </td>
        </tr>
      )}

      {selectedFarmer?.deshi_chicken > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐓 Deshi Chicken</td>
          <td className="px-4 py-2 text-right font-bold text-blue-600">
            {selectedFarmer.deshi_chicken}
          </td>
        </tr>
      )}

      {/* Cattle */}

      {selectedFarmer?.dairy_cow > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐄 Dairy Cow</td>
          <td className="px-4 py-2 text-right font-bold text-emerald-600">
            {selectedFarmer.dairy_cow}
          </td>
        </tr>
      )}

      {selectedFarmer?.bull > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐂 Bull</td>
          <td className="px-4 py-2 text-right font-bold text-emerald-600">
            {selectedFarmer.bull}
          </td>
        </tr>
      )}

      {selectedFarmer?.calf_heifer > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐄 Calf / Heifer</td>
          <td className="px-4 py-2 text-right font-bold text-emerald-600">
            {selectedFarmer.calf_heifer}
          </td>
        </tr>
      )}

      {/* Fish */}

      {selectedFarmer?.pangus > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐟 Pangus</td>
          <td className="px-4 py-2 text-right font-bold text-cyan-600">
            {selectedFarmer.pangus}
          </td>
        </tr>
      )}

      {selectedFarmer?.tilapia > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐟 Tilapia</td>
          <td className="px-4 py-2 text-right font-bold text-cyan-600">
            {selectedFarmer.tilapia}
          </td>
        </tr>
      )}

      {selectedFarmer?.koi > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐟 Koi</td>
          <td className="px-4 py-2 text-right font-bold text-cyan-600">
            {selectedFarmer.koi}
          </td>
        </tr>
      )}

      {selectedFarmer?.shing > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐟 Shing</td>
          <td className="px-4 py-2 text-right font-bold text-cyan-600">
            {selectedFarmer.shing}
          </td>
        </tr>
      )}

      {selectedFarmer?.pabda > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐟 Pabda</td>
          <td className="px-4 py-2 text-right font-bold text-cyan-600">
            {selectedFarmer.pabda}
          </td>
        </tr>
      )}

      {selectedFarmer?.gulsha > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐟 Gulsha</td>
          <td className="px-4 py-2 text-right font-bold text-cyan-600">
            {selectedFarmer.gulsha}
          </td>
        </tr>
      )}

      {selectedFarmer?.magur > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐟 Magur</td>
          <td className="px-4 py-2 text-right font-bold text-cyan-600">
            {selectedFarmer.magur}
          </td>
        </tr>
      )}

      {selectedFarmer?.carp > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐟 Carp</td>
          <td className="px-4 py-2 text-right font-bold text-cyan-600">
            {selectedFarmer.carp}
          </td>
        </tr>
      )}

      {selectedFarmer?.golda > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🦐 Golda</td>
          <td className="px-4 py-2 text-right font-bold text-cyan-600">
            {selectedFarmer.golda}
          </td>
        </tr>
      )}

      {selectedFarmer?.bagda > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🦐 Bagda</td>
          <td className="px-4 py-2 text-right font-bold text-cyan-600">
            {selectedFarmer.bagda}
          </td>
        </tr>
      )}

      {selectedFarmer?.tengra > 0 && (
        <tr className="border-t hover:bg-slate-50">
          <td className="px-4 py-2">🐟 Tengra</td>
          <td className="px-4 py-2 text-right font-bold text-cyan-600">
            {selectedFarmer.tengra}
          </td>
        </tr>
      )}

    </tbody>

  </table>

</div>

  <div className="mt-5 border-t pt-4">

    <div className="text-xs text-slate-500 mb-1">
      Feed Type
    </div>

    <div className="font-semibold text-slate-800">
      {selectedFarmer?.feed_type || "-"}
    </div>

  </div>

</div>


      {/* Location & Status */}

       <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">

        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          📍 Location & Status
        </h3>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <div className="text-xs text-slate-500">
              Status
            </div>

            <div className="mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedFarmer?.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {selectedFarmer?.status}
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">
              Coordinates
            </div>

            <div className="font-medium text-slate-700">
              {selectedFarmer?.latitude && selectedFarmer?.longitude
                ? `${selectedFarmer.latitude}, ${selectedFarmer.longitude}`
                : "-"}
            </div>
          </div>

          <div className="col-span-2">
            <div className="text-xs text-slate-500">
              Remarks
            </div>

            <div className="mt-1 rounded-lg bg-white border border-slate-200 p-3 text-slate-700">
              {selectedFarmer?.remarks || "No remarks available."}
            </div>
          </div>

        </div>


      </div>



      </div>

    </div>

  </div>
)}


  {/* Farmer Summary PopUp */}

{showSummary && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <div className="bg-white rounded-xl p-6 w-[95%] max-w-7xl max-h-[90vh] overflow-auto">

    <div className="flex justify-between items-center mb-4">

      <h2 className="text-xl font-bold">
        Farmer Summary
      </h2>

      <button
        onClick={() =>
          setShowSummary(false)
        }
      >
        ✖
      </button>

    </div>

    <h4 className="text-md font-semibold mb-2">
  Farmer Summary of : {selectedCompanyName}
</h4>


<p className="text-md font-semibold mb-2">
  Union: {unionFilter || "All Unions"}
</p>

<p className="text-md font-semibold mb-2">
  Upazila: {upazilaFilter || "All Upazilas"}
</p>

<p className="text-md font-semibold mb-2">
  District: {districtFilter || "All Districts"}
</p>



{/* ==================================================
    EXPORT SUMMARY DROPDOWN
================================================== */}
<div className="relative inline-block mt-2 mb-4">

  <select
    defaultValue=""
    onChange={(e) => {

      const value = e.target.value;

      if (value === "company") {
        exportFarmerSummaryExcel();
      }

      if (value === "poultry") {
        exportPoultrySummaryExcel();
      }

      if (value === "cattle") {
        exportCattleSummaryExcel();
      }

      if (value === "fish") {
        exportFishSummaryExcel();
      }

      e.target.value = "";
    }}
    className="
      bg-slate-800
      text-white
      px-4
      py-2
      rounded-lg
      font-medium
      cursor-pointer
      outline-none
      hover:bg-slate-700
    "
  >

    {/* Button text only — dropdown-এ দেখাবে না */}
    <option
      value=""
      hidden
    >
      📊 Export Summary
    </option>

    <option value="company">
      Company Farmer Summary
    </option>

    <option value="poultry">
      🐔 Poultry Summary
    </option>

    <option value="cattle">
      🐄 Cattle Summary
    </option>

    <option value="fish">
      🐟 Fish Summary
    </option>

  </select>

</div>




      {/* Company Summary Table */}
    <thead>

        <tr className="bg-slate-100">

        <th className="border px-3 py-2 text-sm">
        Company
        </th>

        <th className="border px-3 py-2 text-sm">
        Total Farmers
        </th>

        <th className="border px-3 py-2 text-sm">
        🐔 Poultry Farmers
        </th>

        <th className="border px-3 py-2 text-sm">
        🐄 Cattle Farmers
        </th>

        <th className="border px-3 py-2 text-sm">
        🐟 Fish Farmers
        </th>

        </tr>

        </thead>


        <tbody>

        {companySummary.map((row: any) => (

        <tr
          key={row.company}
          className="hover:bg-slate-50"
        >

        <td className="border px-3 py-2 font-medium">
          {row.company}
        </td>

        <td className="border px-3 py-2 text-center">
          {row.totalFarmers}
        </td>

        <td className="border px-3 py-2 text-center text-amber-700 font-semibold">
          {row.poultryFarmers}
        </td>

        <td className="border px-3 py-2 text-center text-emerald-700 font-semibold">
          {row.cattleFarmers}
        </td>

        <td className="border px-3 py-2 text-center text-sky-700 font-semibold">
          {row.fishFarmers}
        </td>

        </tr>

        ))}

        </tbody>



        {/* Poultry Summary Table */}

        <h3 className="text-lg font-bold mt-8 mb-3">
          🐔 Poultry Summary
        </h3>

        <div className="overflow-x-auto mb-8">

          <table className="w-full border-collapse text-sm">

          <thead className="bg-amber-100">

          <tr>

          <th className="border px-3 py-2 min-w-[180px]">
          Company
          </th>

          <th className="border px-3 py-2">
          Broiler Farms
          </th>

          <th className="border px-3 py-2 bg-amber-50">
          Total Broiler
          </th>

          <th className="border px-3 py-2">
          Layer Farms
          </th>

          <th className="border px-3 py-2 bg-amber-50">
          Total Layer
          </th>

          <th className="border px-3 py-2">
          Sonali Farms
          </th>

          <th className="border px-3 py-2 bg-amber-50">
          Total Sonali
          </th>

          <th className="border px-3 py-2">
          Duck Farms
          </th>

          <th className="border px-3 py-2 bg-amber-50">
          Total Duck
          </th>

          <th className="border px-3 py-2">
          Quail Farms
          </th>

          <th className="border px-3 py-2 bg-amber-50">
          Total Quail
          </th>

          <th className="border px-3 py-2">
          Deshi Farms
          </th>

          <th className="border px-3 py-2 bg-amber-50">
          Total Deshi
          </th>

          <th className="border px-3 py-2 bg-amber-200 font-bold">
          Total Poultry
          </th>

          </tr>

          </thead>

          <tbody>

          {companySummary.map((row:any)=>(

          <tr
          key={row.company}
          className="hover:bg-amber-50"
          >

          <td className="border px-3 py-2 font-semibold whitespace-nowrap">
          {row.company}
          </td>

          <td className="border px-3 py-2 text-center">
          {row.broilerFarmers}
          </td>

          <td className="border px-3 py-2 text-center bg-amber-50 font-semibold text-amber-700">
          {row.broiler}
          </td>

          <td className="border px-3 py-2 text-center">
          {row.layerFarmers}
          </td>

          <td className="border px-3 py-2 text-center bg-amber-50 font-semibold text-amber-700">
          {row.layer}
          </td>

          <td className="border px-3 py-2 text-center">
          {row.sonaliFarmers}
          </td>

          <td className="border px-3 py-2 text-center bg-amber-50 font-semibold text-amber-700">
          {row.sonali}
          </td>

          <td className="border px-3 py-2 text-center">
          {row.duckFarmers}
          </td>

          <td className="border px-3 py-2 text-center bg-amber-50 font-semibold text-amber-700">
          {row.duck}
          </td>

          <td className="border px-3 py-2 text-center">
          {row.quailFarmers}
          </td>

          <td className="border px-3 py-2 text-center bg-amber-50 font-semibold text-amber-700">
          {row.quail}
          </td>

          <td className="border px-3 py-2 text-center">
          {row.deshiFarmers}
          </td>

          <td className="border px-3 py-2 text-center bg-amber-50 font-semibold text-amber-700">
          {row.deshiChicken}
          </td>

          <td className="border px-3 py-2 text-center bg-amber-100 font-bold text-lg">
          {row.totalPoultry}
          </td>

          </tr>

          ))}

          </tbody>

          </table>

          </div>


{/* Cattle Summary Table */}

<h3 className="text-lg font-bold mt-8 mb-3">
🐄 Cattle Summary
</h3>

<div className="overflow-x-auto mb-8">

<table className="w-full border-collapse text-sm">

<thead className="bg-emerald-100">

<tr>

<th className="border px-3 py-2 min-w-[180px]">
Company
</th>

<th className="border px-3 py-2">
Dairy Farms
</th>

<th className="border px-3 py-2 bg-emerald-50">
Total Dairy Cow
</th>

<th className="border px-3 py-2">
Bull Farms
</th>

<th className="border px-3 py-2 bg-emerald-50">
Total Bull
</th>

<th className="border px-3 py-2">
Calf/Heifer Farms
</th>

<th className="border px-3 py-2 bg-emerald-50">
Total Calf/Heifer
</th>

<th className="border px-3 py-2 bg-emerald-200 font-bold">
Total Cattle
</th>

</tr>

</thead>

<tbody>

{companySummary.map((row:any)=>(

<tr key={row.company} className="hover:bg-emerald-50">

<td className="border px-3 py-2 font-semibold whitespace-nowrap">
{row.company}
</td>

<td className="border px-3 py-2 text-center">
{row.dairyCowFarmers}
</td>

<td className="border px-3 py-2 text-center bg-emerald-50 font-semibold text-emerald-700">
{row.dairyCow}
</td>

<td className="border px-3 py-2 text-center">
{row.bullFarmers}
</td>

<td className="border px-3 py-2 text-center bg-emerald-50 font-semibold text-emerald-700">
{row.bull}
</td>

<td className="border px-3 py-2 text-center">
{row.calfHeiferFarmers}
</td>

<td className="border px-3 py-2 text-center bg-emerald-50 font-semibold text-emerald-700">
{row.calfHeifer}
</td>

<td className="border px-3 py-2 text-center bg-emerald-100 font-bold text-lg">
{row.totalCattle}
</td>

</tr>

))}

</tbody>

</table>

</div>




{/* Fish Summary Table */}

<h3 className="text-lg font-bold mt-8 mb-3">
🐟 Fish Summary
</h3>

<div className="overflow-x-auto mb-8">

<table className="w-full border-collapse text-sm">

<thead className="bg-sky-100">

<tr>

<th className="border px-3 py-2 min-w-[180px]">
Company
</th>

<th className="border px-3 py-2">
Pangus Farms
</th>

<th className="border px-3 py-2 bg-sky-50">
Total Pangus
</th>

<th className="border px-3 py-2">
Tilapia Farms
</th>

<th className="border px-3 py-2 bg-sky-50">
Total Tilapia
</th>

<th className="border px-3 py-2">
Koi Farms
</th>

<th className="border px-3 py-2 bg-sky-50">
Total Koi
</th>

<th className="border px-3 py-2">
Shing Farms
</th>

<th className="border px-3 py-2 bg-sky-50">
Total Shing
</th>

<th className="border px-3 py-2">
Pabda Farms
</th>

<th className="border px-3 py-2 bg-sky-50">
Total Pabda
</th>

<th className="border px-3 py-2">
Gulsha Farms
</th>

<th className="border px-3 py-2 bg-sky-50">
Total Gulsha
</th>

<th className="border px-3 py-2">
Magur Farms
</th>

<th className="border px-3 py-2 bg-sky-50">
Total Magur
</th>

<th className="border px-3 py-2">
Carp Farms
</th>

<th className="border px-3 py-2 bg-sky-50">
Total Carp
</th>

<th className="border px-3 py-2">
Golda Farms
</th>

<th className="border px-3 py-2 bg-sky-50">
Total Golda
</th>

<th className="border px-3 py-2">
Bagda Farms
</th>

<th className="border px-3 py-2 bg-sky-50">
Total Bagda
</th>

<th className="border px-3 py-2">
Tengra Farms
</th>

<th className="border px-3 py-2 bg-sky-50">
Total Tengra
</th>

<th className="border px-3 py-2 bg-sky-200 font-bold">
Total Fish
</th>

</tr>

</thead>

<tbody>

{companySummary.map((row:any)=>(

<tr key={row.company} className="hover:bg-sky-50">

<td className="border px-3 py-2 font-semibold whitespace-nowrap">
{row.company}
</td>

<td className="border text-center">{row.pangusFarmers}</td>
<td className="border text-center bg-sky-50 font-semibold text-sky-700">{row.pangus}</td>

<td className="border text-center">{row.tilapiaFarmers}</td>
<td className="border text-center bg-sky-50 font-semibold text-sky-700">{row.tilapia}</td>

<td className="border text-center">{row.koiFarmers}</td>
<td className="border text-center bg-sky-50 font-semibold text-sky-700">{row.koi}</td>

<td className="border text-center">{row.shingFarmers}</td>
<td className="border text-center bg-sky-50 font-semibold text-sky-700">{row.shing}</td>

<td className="border text-center">{row.pabdaFarmers}</td>
<td className="border text-center bg-sky-50 font-semibold text-sky-700">{row.pabda}</td>

<td className="border text-center">{row.gulshaFarmers}</td>
<td className="border text-center bg-sky-50 font-semibold text-sky-700">{row.gulsha}</td>

<td className="border text-center">{row.magurFarmers}</td>
<td className="border text-center bg-sky-50 font-semibold text-sky-700">{row.magur}</td>

<td className="border text-center">{row.carpFarmers}</td>
<td className="border text-center bg-sky-50 font-semibold text-sky-700">{row.carp}</td>

<td className="border text-center">{row.goldaFarmers}</td>
<td className="border text-center bg-sky-50 font-semibold text-sky-700">{row.golda}</td>

<td className="border text-center">{row.bagdaFarmers}</td>
<td className="border text-center bg-sky-50 font-semibold text-sky-700">{row.bagda}</td>

<td className="border text-center">{row.tengraFarmers}</td>
<td className="border text-center bg-sky-50 font-semibold text-sky-700">{row.tengra}</td>

<td className="border text-center bg-sky-100 font-bold text-lg">
{row.totalFish}
</td>

</tr>

))}

</tbody>

</table>

</div>





  </div>

</div>

)}



{/* Map Popup */}

{showMap && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white p-4 rounded w-[900px]">

      <div className="flex justify-between mb-3">

        <h2 className="font-bold text-xl">
          Select Farm Location
        </h2>

        <button
          onClick={() =>
            setShowMap(false)
          }
        >
          ✖
        </button>

      </div>
<LocationPicker
  center={
    selectedUpazila
      ? [
          Number(selectedUpazila.lat),
          Number(selectedUpazila.lon),
        ]
      : selectedDistrict
      ? [
          Number(selectedDistrict.lat),
          Number(selectedDistrict.lon),
        ]
      : [23.6850, 90.3563]
  }

  zoom={
    selectedUpazila
      ? 13
      : selectedDistrict
      ? 11
      : 7
  }

  selectedPosition={
    form.latitude &&
    form.longitude
      ? [
          Number(form.latitude),
          Number(form.longitude),
        ]
      : null
  }

  onSelect={(lat, lng) => {

    setForm({
      ...form,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });

    setShowMap(false);

  }}

  markers={
  <>
    {farmers
      .filter(
        (f) =>
          f.latitude &&
          f.longitude
      )
      .map((farmer) => (
        
        <Marker
            key={farmer.id}
            ref={(ref) => {
              farmerMarkerRefs.current[farmer.id] = ref;
            }}
            position={[
              Number(farmer.latitude),
              Number(farmer.longitude),
            ]}
            icon={createFarmMarker(
              farmer.companies?.logo_url,
              farmer.farm_type,
              farmer.farmer_name
            )}
          />
      ))}
  </>
}


/>

    </div>

  </div>
)}

    </div>
  );
}