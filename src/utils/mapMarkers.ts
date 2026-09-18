import L from "leaflet";

export function getFarmIcon(farmType: string) {
  switch (farmType?.toLowerCase()) {
    case "layer":
      return "🥚";
    case "broiler":
      return "🐔";
    case "cattle":
      return "🐄";
    case "goat":
      return "🐐";
    case "fish":
      return "🐟";
    default:
      return "📍";
  }
}

export function createFarmMarker(
  logoUrl: string,
  farmType: string,
  farmerName: string
) {
  const icon = getFarmIcon(farmType);

  return L.divIcon({
    html: `
      <div
        style="
          display:flex;
          flex-direction:column;
          align-items:center;
        "
      >
        <div
          style="
            background:white;
            padding:1px 5px;
            border-radius:5px;
            font-size:9px;
            font-weight:600;
            white-space:nowrap;
            box-shadow:0 1px 3px rgba(0,0,0,.20);
            margin-bottom:-6px;
            z-index:999;
            position:relative;
          "
        >
          ${farmerName}
        </div>

        <div
          style="
            display:flex;
            align-items:flex-end;
            margin-top:-2px;
          "
        >
          <img
            src="${logoUrl}"
            style="
              width:45px;
              height:29px;
              object-fit:contain;
            "
          />

          <div
            style="
              margin-left:-8px;
              margin-bottom:-1px;
              font-size:16px;
              z-index:999;
            "
          >
            ${icon}
          </div>
        </div>
      </div>
    `,
    className: "",
    iconSize: [80, 55],
  });
}

export function createAgentMarker(logoUrl: string, agentName: string) {
  return L.divIcon({
    html: `
      <div
        style="
          display:flex;
          flex-direction:column;
          align-items:center;
        "
      >
        <div
          style="
            font-size:9px;
            font-weight:bold;
            color:black;
            background:white;
            padding:1px 4px;
            margin-bottom:-3px;
            line-height:1;
            white-space:nowrap;
            box-shadow:0 0 3px rgba(0,0,0,.3);
          "
        >
          ${agentName}
        </div>

        <img
          src="${logoUrl}"
          style="
            width:45px;
            object-fit:contain;
          "
        />
      </div>
    `,
    className: "",
    iconSize: [80, 75],
  });
}

export function createSubAgentMarker(logoUrl: string, subAgentName: string) {
  return L.divIcon({
    html: `
      <div
        style="
          display:flex;
          flex-direction:column;
          align-items:center;
        "
      >
        <div
          style="
            font-size:9px;
            font-weight:bold;
            color:#1e3a8a;
            background:#e0f2fe;
            padding:1px 4px;
            border:1px solid #0284c7;
            border-radius:3px;
            margin-bottom:-3px;
            line-height:1;
            white-space:nowrap;
            box-shadow:0 0 3px rgba(0,0,0,.3);
            z-index:999;
          "
        >
          ${subAgentName}
        </div>

        <div
          style="
            position:relative;
            display:inline-block;
          "
        >
          <img
            src="${logoUrl}"
            style="
              width:40px;
              object-fit:contain;
              border-bottom:2px solid #0284c7;
            "
          />
          <span
            style="
              position:absolute;
              bottom:-4px;
              right:-6px;
              font-size:10px;
              background:#0284c7;
              color:white;
              border-radius:50%;
              width:14px;
              height:14px;
              display:flex;
              align-items:center;
              justify-content:center;
              font-weight:bold;
            "
          >
            S
          </span>
        </div>
      </div>
    `,
    className: "",
    iconSize: [80, 75],
  });
}

export function createRetailerMarker(logoUrl: string, retailerName: string) {
  return L.divIcon({
    html: `
      <div
        style="
          display:flex;
          flex-direction:column;
          align-items:center;
        "
      >
        <div
          style="
            font-size:9px;
            font-weight:bold;
            color:#166534;
            background:#dcfce7;
            padding:1px 4px;
            border:1px solid #22c55e;
            border-radius:3px;
            margin-bottom:-3px;
            line-height:1;
            white-space:nowrap;
            box-shadow:0 0 3px rgba(0,0,0,.3);
            z-index:999;
          "
        >
          ${retailerName}
        </div>

        <div
          style="
            position:relative;
            display:inline-block;
          "
        >
          <img
            src="${logoUrl}"
            style="
              width:40px;
              object-fit:contain;
              border-bottom:2px solid #22c55e;
            "
          />
          <span
            style="
              position:absolute;
              bottom:-4px;
              right:-6px;
              font-size:10px;
              background:#22c55e;
              color:white;
              border-radius:50%;
              width:14px;
              height:14px;
              display:flex;
              align-items:center;
              justify-content:center;
              font-weight:bold;
            "
          >
            R
          </span>
        </div>
      </div>
    `,
    className: "",
    iconSize: [80, 75],
  });
}