const SPECS = [
  { label: "Make",        key: "make"        },
  { label: "Model",       key: "model"       },
  { label: "Year",        key: "year"        },
  { label: "Type",        key: "type"        },
  { label: "Category",    key: "category"    },
  { label: "Condition",   key: "condition"   },
  { label: "Drive Type",  key: "driveType"   },
  { label: "Color",       key: "color"       },
  { label: "Doors",       key: "door"        },
  { label: "Range",       key: "range",      suffix: " km" },
  { label: "Power",       key: "power"       },
  { label: "Max Speed",   key: "maxSpeed",   suffix: " km/h" },
  { label: "Battery",     key: "batterySize", suffix: " kWh" },
  { label: "Mileage",     key: "mileage",    suffix: " km" },
  { label: "VIN",         key: "vin"         },
];
 
export function Specification({ listing }: { listing: Record<string, any> }) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#18122b] border border-gray-100 dark:border-[#2d1e5f] shadow-sm">
      <h2 className="text-xs font-semibold text-gray-500 dark:text-[#8b949e] mb-4 tracking-widest uppercase">
        Specifications
      </h2>
      <div className="divide-y divide-gray-100 dark:divide-[#2d1e5f]">
        {SPECS.map(({ label, key, suffix }) => {
          const val = listing[key];
          if (!val) return null;
          return (
            <div key={key} className="flex justify-between py-2.5 text-sm">
              <span className="text-gray-500 dark:text-[#8b949e]">{label}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {val}{suffix ?? ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}