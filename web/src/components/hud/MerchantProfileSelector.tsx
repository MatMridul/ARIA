import * as React from "react";
import { useAppStore, MERCHANT_PROFILES, type MerchantProfileId } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building, Plane, ShoppingBag, Zap } from "lucide-react";

const PROFILE_ICONS: Record<MerchantProfileId, React.ComponentType<{ className?: string }>> = {
  ecommerce_retail: ShoppingBag,
  quick_commerce: Zap,
  travel_airlines: Plane,
  enterprise_saas: Building,
};

export function MerchantProfileSelector() {
  const { merchantProfile, setMerchantProfile } = useAppStore();
  const current = MERCHANT_PROFILES[merchantProfile];
  const Icon = PROFILE_ICONS[merchantProfile] || ShoppingBag;

  return (
    <div className="w-48 sm:w-56">
      <Select
        value={merchantProfile}
        onValueChange={(val) => setMerchantProfile(val as MerchantProfileId)}
      >
        <SelectTrigger className="h-8 bg-white/[0.04] border-white/[0.1] text-xs font-medium">
          <div className="flex items-center gap-2 truncate">
            <Icon className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="truncate">{current.name}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Industry Profile & Scale</SelectLabel>
            {(Object.keys(MERCHANT_PROFILES) as MerchantProfileId[]).map((id) => {
              const p = MERCHANT_PROFILES[id];
              const ProfileIcon = PROFILE_ICONS[id];
              return (
                <SelectItem key={id} value={id} className="text-xs py-2">
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="flex items-start gap-2 min-w-0 text-left">
                      <ProfileIcon className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-semibold text-text-primary truncate">{p.name}</div>
                        <div className="text-3xs text-text-muted truncate">
                          AOV ₹{p.aov.toLocaleString("en-IN")} · {p.tps.toLocaleString()} tx/min
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-3xs px-1.5 py-0 shrink-0 font-mono">
                      {p.badge}
                    </Badge>
                  </div>
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
