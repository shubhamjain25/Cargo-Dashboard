"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import type { CargoItem } from "@/lib/types";

const KG_TO_LBS = 2.20462;

interface CargoTableProps {
  data: CargoItem[];
  isLoading: boolean;
}

/**
 * Custom sorting algorithm:
 * 1. Sort by weight descending (heaviest to lightest)
 * 2. Pin all "Earth" destinations to the absolute bottom
 */
function sortCargoWithEarthOverride(items: CargoItem[]): CargoItem[] {
  // Separate Earth-destined cargo from others
  const earthCargo: CargoItem[] = [];
  const otherCargo: CargoItem[] = [];

  for (const item of items) {
    if (item.destination.toLowerCase() === "earth") {
      earthCargo.push(item);
    } else {
      otherCargo.push(item);
    }
  }

  // Sort both arrays by weight descending
  const sortByWeightDesc = (a: CargoItem, b: CargoItem) => b.weight - a.weight;

  otherCargo.sort(sortByWeightDesc);
  earthCargo.sort(sortByWeightDesc);

  // Return non-Earth items first, then Earth items pinned at the bottom
  return [...otherCargo, ...earthCargo];
}

export function CargoTable({ data, isLoading }: CargoTableProps) {
  const { isAdmin, isStandard } = useAuth();

  // Apply custom sorting algorithm
  const sortedData = useMemo(() => sortCargoWithEarthOverride(data), [data]);

  // Transform weights based on role
  const displayData = useMemo(() => {
    return sortedData.map((item) => ({
      ...item,
      displayWeight: isStandard
        ? (item.weight * KG_TO_LBS).toFixed(2)
        : item.weight.toFixed(2),
      weightUnit: isStandard ? "LBS" : "KG",
    }));
  }, [sortedData, isStandard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading cargo data...
      </div>
    );
  }

  return (<div></div>);
}
